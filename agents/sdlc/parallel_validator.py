"""
Parallel Validator - Spawnt N gleiche Agent-Instanzen parallel für redundante Prüfung.

Merged Findings von allen Agents und dedupliziert nach location + problem.
Bietet bessere Abdeckung, da ein Agent etwas finden kann, was der andere übersieht.
"""

import asyncio
from dataclasses import dataclass, field
from typing import Type, Any, Callable

from .agents.reviewer import Finding


@dataclass
class MergedResult:
    """Ergebnis von parallelen Agent-Runs."""
    findings: list[Finding] = field(default_factory=list)
    agent_count: int = 0
    fix_required: bool = False
    success: bool = True
    error: str | None = None

    def to_dict(self) -> dict:
        """Konvertiert zu Dict für JSON."""
        return {
            "findings": [
                {
                    "id": f.id,
                    "severity": f.severity,
                    "location": f.location,
                    "problem": f.problem,
                    "fix_instruction": f.fix_instruction,
                    "fix_code": f.fix_code,
                    "fix_agent": f.fix_agent
                }
                for f in self.findings
            ],
            "agent_count": self.agent_count,
            "fix_required": self.fix_required,
            "success": self.success,
            "error": self.error
        }


class ParallelValidator:
    """
    Spawnt N gleiche Agent-Instanzen parallel für redundante Prüfung.

    Merged Findings und dedupliziert nach location + problem (erste 50 chars).
    Wenn ein Agent einen Fehler wirft, werden die Ergebnisse der anderen trotzdem genutzt.

    Beispiel:
        validator = ParallelValidator(TesterAgent, count=2, working_dir=".")
        result = await validator.validate_parallel(
            "create_and_run_tests",
            feature_name, spec, files_created
        )
    """

    def __init__(
        self,
        agent_class: Type,
        count: int = 2,
        working_dir: str = "."
    ):
        """
        Initialisiert den ParallelValidator.

        Args:
            agent_class: Die Agent-Klasse die instanziiert werden soll
            count: Anzahl der parallelen Instanzen (default: 2)
            working_dir: Arbeitsverzeichnis für die Agents
        """
        self.agent_class = agent_class
        self.count = count
        self.working_dir = working_dir
        # Agents werden bei jedem validate_parallel neu erstellt
        # um frischen State zu garantieren
        self.agents: list[Any] = []

    def _create_agents(self) -> list[Any]:
        """Erstellt frische Agent-Instanzen."""
        return [self.agent_class(self.working_dir) for _ in range(self.count)]

    async def validate_parallel(
        self,
        method: str,
        *args,
        on_message: Callable | None = None,
        **kwargs
    ) -> MergedResult:
        """
        Führt dieselbe Methode auf allen Agent-Instanzen parallel aus.

        Args:
            method: Name der Methode die aufgerufen werden soll
            *args: Positional arguments für die Methode
            on_message: Optional callback für Agent-Messages
            **kwargs: Keyword arguments für die Methode

        Returns:
            MergedResult mit allen deduplizierten Findings
        """
        # Frische Agents erstellen
        self.agents = self._create_agents()

        # Coroutines für alle Agents erstellen
        coros = []
        for i, agent in enumerate(self.agents):
            agent_method = getattr(agent, method)
            # on_message mit Agent-Index taggen
            if on_message:
                tagged_callback = lambda msg, idx=i: on_message({
                    "agent_index": idx,
                    "message": msg
                })
                coros.append(agent_method(*args, on_message=tagged_callback, **kwargs))
            else:
                coros.append(agent_method(*args, **kwargs))

        # Parallel ausführen
        results = await asyncio.gather(*coros, return_exceptions=True)

        return self._merge_results(results)

    def _merge_results(self, results: list) -> MergedResult:
        """
        Merged und dedupliziert Findings von allen Agent-Runs.

        Deduplizierung basiert auf: location + erste 50 chars vom Problem.
        Das verhindert echte Duplikate, lässt aber ähnliche aber unterschiedliche
        Findings durch.

        Args:
            results: Liste von Agent-Results oder Exceptions

        Returns:
            MergedResult mit allen eindeutigen Findings
        """
        all_findings: list[Finding] = []
        seen: set[str] = set()
        errors: list[str] = []

        for i, result in enumerate(results):
            if isinstance(result, Exception):
                errors.append(f"Agent {i}: {str(result)}")
                continue

            # Findings extrahieren (verschiedene Result-Typen unterstützen)
            findings = []
            if hasattr(result, 'findings'):
                findings = result.findings or []
            elif hasattr(result, 'to_dict'):
                result_dict = result.to_dict()
                if 'findings' in result_dict:
                    findings = result_dict['findings']

            for f in findings:
                # Dedup Key erstellen
                if isinstance(f, Finding):
                    key = f"{f.location}:{f.problem[:50]}"
                    if key not in seen:
                        seen.add(key)
                        all_findings.append(f)
                elif isinstance(f, dict):
                    # Falls Finding als Dict kommt
                    key = f"{f.get('location', '')}:{f.get('problem', '')[:50]}"
                    if key not in seen:
                        seen.add(key)
                        all_findings.append(Finding(
                            id=f.get('id', f'merged-{len(all_findings):03d}'),
                            severity=f.get('severity', 'major'),
                            location=f.get('location', 'unknown'),
                            problem=f.get('problem', ''),
                            fix_instruction=f.get('fix_instruction', ''),
                            fix_code=f.get('fix_code', ''),
                            fix_agent=f.get('fix_agent', 'builder')
                        ))

        successful_count = len([r for r in results if not isinstance(r, Exception)])

        return MergedResult(
            findings=all_findings,
            agent_count=successful_count,
            fix_required=len(all_findings) > 0,
            success=successful_count > 0,
            error="; ".join(errors) if errors else None
        )

    async def validate_with_consensus(
        self,
        method: str,
        *args,
        min_agreement: int = 2,
        **kwargs
    ) -> MergedResult:
        """
        Alternative: Nur Findings die von mindestens N Agents gefunden wurden.

        Nützlich wenn man false positives reduzieren will - nur Issues die
        mehrere Agents unabhängig finden werden zurückgegeben.

        Args:
            method: Name der Methode
            *args: Arguments
            min_agreement: Mindestanzahl Agents die das Finding finden müssen
            **kwargs: Keyword arguments

        Returns:
            MergedResult nur mit Findings die Konsens haben
        """
        self.agents = self._create_agents()

        coros = [getattr(agent, method)(*args, **kwargs) for agent in self.agents]
        results = await asyncio.gather(*coros, return_exceptions=True)

        # Findings mit Zähler sammeln
        finding_counts: dict[str, tuple[Finding, int]] = {}

        for result in results:
            if isinstance(result, Exception):
                continue
            if hasattr(result, 'findings'):
                for f in result.findings or []:
                    key = f"{f.location}:{f.problem[:50]}"
                    if key in finding_counts:
                        _, count = finding_counts[key]
                        finding_counts[key] = (f, count + 1)
                    else:
                        finding_counts[key] = (f, 1)

        # Nur Findings mit genug Agreement
        consensus_findings = [
            finding for finding, count in finding_counts.values()
            if count >= min_agreement
        ]

        successful_count = len([r for r in results if not isinstance(r, Exception)])

        return MergedResult(
            findings=consensus_findings,
            agent_count=successful_count,
            fix_required=len(consensus_findings) > 0,
            success=successful_count > 0
        )
