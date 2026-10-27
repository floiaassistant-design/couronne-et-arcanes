"""Exécuter chaque suite du groupe une fois ; conserver tout échec jusqu'au verdict."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / 'scripts/ci_browser_groups.json'


def load_groups():
    groups = json.loads(CONFIG.read_text())
    commands = [cmd for group in groups.values() for cmd in group]
    if not groups or not commands or len({tuple(c) for c in commands}) != len(commands):
        raise ValueError('Plan navigateur vide ou commandes en double')
    for cmd in commands:
        if not isinstance(cmd, list) or not cmd or not all(isinstance(x, str) for x in cmd):
            raise ValueError('Commande navigateur invalide')
        if not cmd[0].startswith('tests/browser_') or not cmd[0].endswith('.py') or not (ROOT / cmd[0]).is_file():
            raise ValueError('Suite navigateur introuvable : ' + cmd[0])
    return groups


def run_commands(commands):
    failed = False
    rows = []
    for command in commands:
        started = time.monotonic()
        print('RUN ' + ' '.join(command), flush=True)
        result = subprocess.run([sys.executable, *command], cwd=ROOT, check=False)
        duration = round(time.monotonic() - started, 1)
        failed |= result.returncode != 0
        status = 'PASS' if result.returncode == 0 else 'FAIL'
        print(f'{status} {" ".join(command)} ({duration}s)', flush=True)
        rows.append(f'| `{ " ".join(command) }` | {duration} s | {status} |')
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a') as output:
            output.write('| Suite | Durée | Résultat |\n| --- | --- | --- |\n' + '\n'.join(rows) + '\n')
    return 1 if failed else 0


def main():
    groups = load_groups()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('group', choices=groups)
    parser.add_argument('--list', action='store_true', help='Lister sans lancer le navigateur')
    args = parser.parse_args()
    if args.list:
        print(json.dumps(groups[args.group], indent=2))
        return 0
    return run_commands(groups[args.group])


if __name__ == '__main__':
    sys.exit(main())
