"""Contrôles sans navigateur : couverture exacte, répartition et propagation des échecs."""
import importlib.util
import os
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tests'))
from evolution_ci_plan import PARTS, evolution_cases
spec = importlib.util.spec_from_file_location('runner', ROOT / 'scripts/run_browser_group.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)


class Pipeline(unittest.TestCase):
    def test_evolution_partition_preserves_every_original_case(self):
        expected = []
        for label in ['desktop', 'portrait', 'landscape']:
            for index in range(4):
                expected.append((label, index, label == 'desktop' or index == (0 if label == 'portrait' else 1)))
        all_cases = evolution_cases(4)
        actual = [(c['label'], c['index'], c['full']) for c in all_cases if c['kind'] == 'earned']
        self.assertEqual(actual, expected)
        split = [c for part in PARTS for c in evolution_cases(4, part)]
        self.assertEqual(split, all_cases)
        self.assertEqual(len(split), 14)  # 12 parcours fichier + web + bloc de récupération.
        self.assertEqual(sum(c.get('full', c['kind'] == 'web') for c in split), 7)
        for c in split:
            if c['kind'] == 'earned':
                self.assertEqual(c['touch'], c['label'] != 'desktop')
        with self.assertRaises(ValueError):
            evolution_cases(4, 'inconnu')

    def test_group_configuration_and_unknown_group_fail_closed(self):
        groups = runner.load_groups()
        self.assertEqual(set(groups), {'interface', 'combat', 'catalogue', 'moteur'})
        commands = [c for group in groups.values() for c in group]
        self.assertEqual(len(commands), 30)
        parts = [c[-1] for c in commands if c[0].endswith('browser_evolution_trials.py')]
        self.assertCountEqual(parts, PARTS)
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/run_browser_group.py'), 'inconnu'], capture_output=True)
        self.assertNotEqual(result.returncode, 0)

    def test_a_failure_survives_a_later_success_and_all_commands_run(self):
        with tempfile.TemporaryDirectory() as directory:
            first = Path(directory) / 'failure.py'
            last = Path(directory) / 'success.py'
            receipt = Path(directory) / 'ran'
            first.write_text('raise SystemExit(7)\n')
            last.write_text('from pathlib import Path\nPath(' + repr(str(receipt)) + ').write_text("done")\n')
            summary = Path(directory) / 'summary.md'
            with patch.dict(os.environ, {'GITHUB_STEP_SUMMARY': str(summary)}):
                self.assertEqual(runner.run_commands([[str(first)], [str(last)]]), 1)
                self.assertTrue(receipt.exists())
                self.assertEqual(runner.run_commands([[str(last)]]), 0)
            self.assertIn('FAIL', summary.read_text())
            self.assertIn('PASS', summary.read_text())


if __name__ == '__main__':
    unittest.main()
