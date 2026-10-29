"""Découpage d'exécution seulement : les mêmes parcours, assertions et combats."""
PARTS = ('desktop', 'portrait', 'landscape', 'web-recovery')
VIEWPORTS = (
    ('desktop', {'width': 1440, 'height': 1000}, False),
    ('portrait', {'width': 390, 'height': 844}, True),
    ('landscape', {'width': 844, 'height': 390}, True),
)


def evolution_cases(count, part=None):
    if part is not None and part not in PARTS:
        raise ValueError('Partie d’épreuves inconnue')
    cases = []
    for label, viewport, touch in VIEWPORTS:
        if part is not None and part != label:
            continue
        for index in range(count):
            cases.append({'kind': 'earned', 'index': index, 'label': label,
                          'viewport': viewport, 'touch': touch,
                          'full': label == 'desktop' or index == (0 if label == 'portrait' else 1)})
    if part is None or part == 'web-recovery':
        cases.extend([{'kind': 'web'}, {'kind': 'recovery'}])
    return cases


def card_pack_cases(part=None):
    if part is not None and part not in PARTS:
        raise ValueError('Partie de paquets inconnue')
    cases = [{'label': label, 'viewport': viewport} for label, viewport, _ in VIEWPORTS
             if part is None or part == label]
    if part is None or part == 'web-recovery':
        cases.append({'label': 'web', 'viewport': {'width': 1366, 'height': 900}})
    return cases


def ascension_cases(part=None):
    if part is not None and part not in PARTS:
        raise ValueError('Partie d’ascensions inconnue')
    cases = [{'label': label, 'viewport': viewport, 'index': index % 2,
              'full': index < 2, 'touch': touch}
             for index, (label, viewport, touch) in enumerate(VIEWPORTS)
             if part is None or part == label]
    if part is None or part == 'web-recovery':
        cases.append({'label': 'web', 'viewport': {'width': 1366, 'height': 900},
                      'index': 1, 'full': False, 'touch': False})
    return cases
