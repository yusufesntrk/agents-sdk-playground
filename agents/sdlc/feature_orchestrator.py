"""
Feature Orchestrator - Isoliertes Feature Processing.

Verarbeitet EIN Feature durch die komplette Agent-Chain.
Wird vom Haupt-Orchestrator genutzt um Features parallel zu bearbeiten.

Key Features:
- Isolierter Context pro Feature
- Volle Agent-Chain mit Fix-Loops
- Kompakte Summary am Ende
- Keine User-Fragen (autonom)
"""

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Callable, Any

from .agents import (
    PlannerAgent, BuilderAgent, ReviewerAgent,
    UIReviewerAgent, TesterAgent, QAAgent, DebuggerAgent,
    Finding, ReviewStatus
)


class FeatureStatus(Enum):
    """Feature Processing Status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    PARTIAL = "partial"
    FAILED = "failed"


@dataclass
class PhaseResult:
    """Ergebnis einer einzelnen Phase."""
    phase: str
    success: bool
    fix_loops: int = 0
    issues_found: int = 0
    issues_fixed: int = 0
    files_affected: list[str] = field(default_factory=list)
    error: str | None = None


@dataclass
class FeatureResult:
    """Kompaktes Ergebnis eines Feature-Durchlaufs."""
    feature_name: str
    status: FeatureStatus
    phases: list[PhaseResult] = field(default_factory=list)
    files_created: list[str] = field(default_factory=list)
    files_modified: list[str] = field(default_factory=list)
    test_files: list[str] = field(default_factory=list)
    remaining_issues: list[Finding] = field(default_factory=list)
    assumptions: list[str] = field(default_factory=list)
    duration_ms: int = 0
    error: str | None = None

    def to_summary(self) -> str:
        """Generiert eine kompakte Summary."""
        status_emoji = {
            FeatureStatus.SUCCESS: "✅",
            FeatureStatus.PARTIAL: "⚠️",
            FeatureStatus.FAILED: "❌",
            FeatureStatus.PENDING: "⏳",
            FeatureStatus.IN_PROGRESS: "🔄"
        }

        lines = [
            f"## Feature: {self.feature_name}",
            f"### Status: {status_emoji.get(self.status, '?')} {self.status.value.upper()}",
            "",
            "### Agent Chain:"
        ]

        for phase in self.phases:
            emoji = "✅" if phase.success else "❌"
            detail = ""
            if phase.fix_loops > 0:
                detail = f" ({phase.fix_loops} fix loops, {phase.issues_fixed}/{phase.issues_found} fixed)"
            lines.append(f"- {emoji} {phase.phase}{detail}")

        if self.files_created:
            lines.append("")
            lines.append("### Erstellte Dateien:")
            for f in self.files_created:
                lines.append(f"- {f}")

        if self.test_files:
            lines.append("")
            lines.append("### Test-Dateien:")
            for f in self.test_files:
                lines.append(f"- {f}")

        if self.remaining_issues:
            lines.append("")
            lines.append("### Verbleibende Issues:")
            for issue in self.remaining_issues:
                lines.append(f"- {issue.id}: {issue.problem} at {issue.location}")

        if self.assumptions:
            lines.append("")
            lines.append("### Annahmen:")
            for a in self.assumptions:
                lines.append(f"- {a}")

        lines.append("")
        lines.append(f"### Dauer: {self.duration_ms}ms")

        return "\n".join(lines)

    def to_dict(self) -> dict:
        """Konvertiert zu Dict für JSON."""
        return {
            "feature_name": self.feature_name,
            "status": self.status.value,
            "phases": [
                {
                    "phase": p.phase,
                    "success": p.success,
                    "fix_loops": p.fix_loops,
                    "issues_found": p.issues_found,
                    "issues_fixed": p.issues_fixed,
                    "files_affected": p.files_affected,
                    "error": p.error
                }
                for p in self.phases
            ],
            "files_created": self.files_created,
            "files_modified": self.files_modified,
            "test_files": self.test_files,
            "remaining_issues": [
                {"id": i.id, "problem": i.problem, "location": i.location}
                for i in self.remaining_issues
            ],
            "assumptions": self.assumptions,
            "duration_ms": self.duration_ms,
            "error": self.error
        }


class FeatureOrchestrator:
    """
    Feature Orchestrator - Isoliertes Feature Processing.

    Verarbeitet ein einzelnes Feature durch die komplette Pipeline.
    Trifft autonome Entscheidungen ohne User-Fragen.

    Workflow:
    1. Planning (optional wenn Spec gegeben)
    2. Building
    3. Code Review + Fix-Loop (UNBEGRENZT!)
    4. UI Review + Fix-Loop (UNBEGRENZT!)
    5. Testing + Fix-Loop (UNBEGRENZT!)
    6. QA Check + Fix-Loop (UNBEGRENZT!)

    WICHTIG: Fix-Loops laufen bis ALLE Issues gefixt sind!
    Nur bei Deadlock (gleiche Findings 3x) wird abgebrochen.
    """

    MAX_IDENTICAL_LOOPS = 3  # Deadlock-Schutz

    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir

        # Agents
        self.planner = PlannerAgent(working_dir)
        self.builder = BuilderAgent(working_dir)
        self.reviewer = ReviewerAgent(working_dir)
        self.ui_reviewer = UIReviewerAgent(working_dir)
        self.tester = TesterAgent(working_dir)
        self.qa = QAAgent(working_dir)
        self.debugger = DebuggerAgent(working_dir)

        # Callbacks
        self._on_phase_start: Callable[[str], None] | None = None
        self._on_phase_complete: Callable[[PhaseResult], None] | None = None
        self._on_fix_loop: Callable[[str, int], None] | None = None

    def on_phase_start(self, callback: Callable[[str], None]) -> None:
        """Registriert Callback für Phase-Start."""
        self._on_phase_start = callback

    def on_phase_complete(self, callback: Callable[[PhaseResult], None]) -> None:
        """Registriert Callback für Phase-Complete."""
        self._on_phase_complete = callback

    def on_fix_loop(self, callback: Callable[[str, int], None]) -> None:
        """Registriert Callback für Fix-Loops."""
        self._on_fix_loop = callback

    def _emit_phase_start(self, phase: str) -> None:
        if self._on_phase_start:
            self._on_phase_start(phase)

    def _emit_phase_complete(self, result: PhaseResult) -> None:
        if self._on_phase_complete:
            self._on_phase_complete(result)

    def _emit_fix_loop(self, phase: str, loop: int) -> None:
        if self._on_fix_loop:
            self._on_fix_loop(phase, loop)

    async def process_feature(
        self,
        feature_name: str,
        description: str,
        spec: str | None = None,
        skip_planning: bool = False,
        skip_tests: bool = False
    ) -> FeatureResult:
        """
        Verarbeitet ein Feature durch die komplette Pipeline.

        Args:
            feature_name: Name des Features
            description: Beschreibung was gebaut werden soll
            spec: Optional: Bereits vorhandene Spec (überspringt Planning)
            skip_planning: Planning überspringen (nur wenn spec gegeben)
            skip_tests: Testing-Phase überspringen

        Returns:
            FeatureResult mit kompakter Summary
        """
        start_time = datetime.now()
        result = FeatureResult(
            feature_name=feature_name,
            status=FeatureStatus.IN_PROGRESS
        )

        files_created = []
        files_modified = []
        test_files = []
        current_spec = spec or ""
        assumptions = []

        try:
            # ===== PHASE 1: PLANNING =====
            if not skip_planning or not spec:
                self._emit_phase_start("planning")

                plan_result = await self.planner.plan(description)

                if not plan_result.success:
                    result.phases.append(PhaseResult(
                        phase="planning",
                        success=False,
                        error=plan_result.error
                    ))
                    raise Exception(f"Planning failed: {plan_result.error}")

                current_spec = plan_result.spec
                result.phases.append(PhaseResult(
                    phase="planning",
                    success=True,
                    files_affected=plan_result.files_to_modify + plan_result.files_to_create
                ))
                self._emit_phase_complete(result.phases[-1])

            # ===== PHASE 2: BUILDING =====
            self._emit_phase_start("building")

            build_result = await self.builder.build(current_spec)

            if not build_result.success:
                result.phases.append(PhaseResult(
                    phase="building",
                    success=False,
                    error=build_result.error
                ))
                raise Exception(f"Building failed: {build_result.error}")

            files_created = build_result.files_created
            files_modified = build_result.files_modified

            result.phases.append(PhaseResult(
                phase="building",
                success=True,
                files_affected=files_created + files_modified
            ))
            self._emit_phase_complete(result.phases[-1])

            # ===== PHASE 3: CODE REVIEW + FIX-LOOP =====
            self._emit_phase_start("code_review")

            review_result = await self.reviewer.review(
                current_spec, files_modified, files_created
            )

            phase_result = PhaseResult(
                phase="code_review",
                success=True,
                files_affected=files_modified + files_created
            )

            if review_result.fix_required and review_result.findings:
                phase_result.issues_found = len(review_result.findings)
                remaining = await self._run_fix_loop(
                    "code_review",
                    review_result.findings,
                    current_spec,
                    files_modified + files_created,
                    phase_result
                )
                if remaining:
                    result.remaining_issues.extend(remaining)

            result.phases.append(phase_result)
            self._emit_phase_complete(phase_result)

            # ===== PHASE 4: UI REVIEW + FIX-LOOP (wenn UI-Dateien) =====
            ui_files = [f for f in files_created if self._is_ui_file(f)]
            if ui_files:
                self._emit_phase_start("ui_review")

                ui_result = await self.ui_reviewer.review(ui_files)

                phase_result = PhaseResult(
                    phase="ui_review",
                    success=True,
                    files_affected=ui_files
                )

                if ui_result.fix_required and ui_result.findings:
                    phase_result.issues_found = len(ui_result.findings)
                    remaining = await self._run_ui_fix_loop(
                        ui_result.findings,
                        ui_files,
                        current_spec,
                        phase_result
                    )
                    if remaining:
                        result.remaining_issues.extend(remaining)

                result.phases.append(phase_result)
                self._emit_phase_complete(phase_result)

            # ===== PHASE 5: TESTING + FIX-LOOP =====
            if not skip_tests:
                self._emit_phase_start("testing")

                test_result = await self.tester.create_and_run_tests(
                    feature_name, current_spec, files_created
                )

                test_files = test_result.test_files_created

                phase_result = PhaseResult(
                    phase="testing",
                    success=True,
                    files_affected=test_files
                )

                if test_result.fix_required and test_result.findings:
                    phase_result.issues_found = len(test_result.findings)
                    remaining = await self._run_test_fix_loop(
                        test_result.findings,
                        test_files,
                        current_spec,
                        phase_result
                    )
                    if remaining:
                        result.remaining_issues.extend(remaining)

                result.phases.append(phase_result)
                self._emit_phase_complete(phase_result)

            # ===== PHASE 6: QA CHECK + FIX-LOOP =====
            self._emit_phase_start("qa")

            qa_result = await self.qa.check(
                feature_name, files_created, files_modified
            )

            phase_result = PhaseResult(
                phase="qa",
                success=True,
                files_affected=files_created + files_modified
            )

            if qa_result.fix_required and qa_result.findings:
                phase_result.issues_found = len(qa_result.findings)
                remaining = await self._run_qa_fix_loop(
                    qa_result.findings,
                    files_modified + files_created,
                    current_spec,
                    phase_result
                )
                if remaining:
                    result.remaining_issues.extend(remaining)

            result.phases.append(phase_result)
            self._emit_phase_complete(phase_result)

            # ===== FINALIZE =====
            result.files_created = files_created
            result.files_modified = files_modified
            result.test_files = test_files
            result.assumptions = assumptions

            # Status bestimmen
            if result.remaining_issues:
                result.status = FeatureStatus.PARTIAL
            else:
                result.status = FeatureStatus.SUCCESS

        except Exception as e:
            result.status = FeatureStatus.FAILED
            result.error = str(e)

        # Duration
        end_time = datetime.now()
        result.duration_ms = int((end_time - start_time).total_seconds() * 1000)

        return result

    def _is_ui_file(self, path: str) -> bool:
        """Prüft ob eine Datei eine UI-Komponente ist."""
        ui_indicators = [
            ".tsx", ".jsx",
            "component", "page", "view",
            "/ui/", "/components/", "/pages/"
        ]
        path_lower = path.lower()
        return any(ind in path_lower for ind in ui_indicators)

    async def _run_fix_loop(
        self,
        phase: str,
        findings: list[Finding],
        spec: str,
        files: list[str],
        phase_result: PhaseResult
    ) -> list[Finding]:
        """Führt einen Code-Review Fix-Loop durch - UNBEGRENZT bis alle gefixt!"""
        current_findings = findings
        loop_count = 0

        # Deadlock-Detection
        previous_finding_ids: list[set[str]] = []

        while current_findings:  # Läuft bis KEINE Findings mehr!
            loop_count += 1

            # Deadlock-Detection
            current_ids = {f.id for f in current_findings}
            identical_count = sum(1 for prev in previous_finding_ids[-self.MAX_IDENTICAL_LOOPS:]
                                  if prev == current_ids)

            if identical_count >= self.MAX_IDENTICAL_LOOPS:
                # Deadlock - gleiche Findings werden nicht gefixt
                return current_findings

            previous_finding_ids.append(current_ids)
            self._emit_fix_loop(phase, loop_count)
            phase_result.fix_loops = loop_count

            # Fix durchführen
            fix_spec = self._build_fix_spec(spec, current_findings)
            await self.builder.build(fix_spec)

            # Re-validate
            validate_result = await self.reviewer.validate_fix(
                current_findings, files, loop_count
            )

            if not validate_result.fix_required:
                phase_result.issues_fixed = phase_result.issues_found
                return []

            fixed_count = len(current_findings) - len(validate_result.findings)
            phase_result.issues_fixed += fixed_count
            current_findings = validate_result.findings

        return []

    async def _run_ui_fix_loop(
        self,
        findings: list[Finding],
        files: list[str],
        spec: str,
        phase_result: PhaseResult
    ) -> list[Finding]:
        """Führt einen UI-Review Fix-Loop durch - UNBEGRENZT!"""
        current_findings = findings
        loop_count = 0
        previous_finding_ids: list[set[str]] = []

        while current_findings:
            loop_count += 1
            current_ids = {f.id for f in current_findings}
            identical_count = sum(1 for prev in previous_finding_ids[-self.MAX_IDENTICAL_LOOPS:]
                                  if prev == current_ids)

            if identical_count >= self.MAX_IDENTICAL_LOOPS:
                return current_findings

            previous_finding_ids.append(current_ids)
            self._emit_fix_loop("ui_review", loop_count)
            phase_result.fix_loops = loop_count

            fix_spec = self._build_fix_spec(spec, current_findings)
            await self.builder.build(fix_spec)

            validate_result = await self.ui_reviewer.validate_fix(
                current_findings, files, loop_count
            )

            if not validate_result.fix_required:
                phase_result.issues_fixed = phase_result.issues_found
                return []

            fixed_count = len(current_findings) - len(validate_result.findings)
            phase_result.issues_fixed += fixed_count
            current_findings = validate_result.findings

        return []

    async def _run_test_fix_loop(
        self,
        findings: list[Finding],
        test_files: list[str],
        spec: str,
        phase_result: PhaseResult
    ) -> list[Finding]:
        """Führt einen Test Fix-Loop durch - UNBEGRENZT!"""
        current_findings = findings
        loop_count = 0
        previous_finding_ids: list[set[str]] = []

        while current_findings:
            loop_count += 1
            current_ids = {f.id for f in current_findings}
            identical_count = sum(1 for prev in previous_finding_ids[-self.MAX_IDENTICAL_LOOPS:]
                                  if prev == current_ids)

            if identical_count >= self.MAX_IDENTICAL_LOOPS:
                return current_findings

            previous_finding_ids.append(current_ids)
            self._emit_fix_loop("testing", loop_count)
            phase_result.fix_loops = loop_count

            fix_spec = self._build_fix_spec(spec, current_findings)
            await self.builder.build(fix_spec)

            validate_result = await self.tester.validate_fix(
                current_findings, test_files, loop_count
            )

            if not validate_result.fix_required:
                phase_result.issues_fixed = phase_result.issues_found
                return []

            fixed_count = len(current_findings) - len(validate_result.findings)
            phase_result.issues_fixed += fixed_count
            current_findings = validate_result.findings

        return []

    async def _run_qa_fix_loop(
        self,
        findings: list[Finding],
        files: list[str],
        spec: str,
        phase_result: PhaseResult
    ) -> list[Finding]:
        """Führt einen QA Fix-Loop durch - UNBEGRENZT!"""
        current_findings = findings
        loop_count = 0
        previous_finding_ids: list[set[str]] = []

        while current_findings:
            loop_count += 1
            current_ids = {f.id for f in current_findings}
            identical_count = sum(1 for prev in previous_finding_ids[-self.MAX_IDENTICAL_LOOPS:]
                                  if prev == current_ids)

            if identical_count >= self.MAX_IDENTICAL_LOOPS:
                return current_findings

            previous_finding_ids.append(current_ids)
            self._emit_fix_loop("qa", loop_count)
            phase_result.fix_loops = loop_count

            fix_spec = self._build_fix_spec(spec, current_findings)
            await self.builder.build(fix_spec)

            validate_result = await self.qa.validate_fix(
                current_findings, files, loop_count
            )

            if not validate_result.fix_required:
                phase_result.issues_fixed = phase_result.issues_found
                return []

            fixed_count = len(current_findings) - len(validate_result.findings)
            phase_result.issues_fixed += fixed_count
            current_findings = validate_result.findings

        return []

    def _build_fix_spec(self, original_spec: str, findings: list[Finding]) -> str:
        """Baut eine Fix-Spec aus Findings."""
        fix_instructions = []
        for f in findings:
            fix_instructions.append(f"""
## Fix: {f.id}
- Location: {f.location}
- Problem: {f.problem}
- Fix: {f.fix_instruction}
- Code: {f.fix_code}
""")

        return f"""
# FIX REQUIRED
Apply these fixes:
{''.join(fix_instructions)}

## Context
{original_spec[:500]}...
"""
