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
