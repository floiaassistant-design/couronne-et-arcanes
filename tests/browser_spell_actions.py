"""Parcours commun du nouveau ciblage ; ne contourne pas le moteur ni les contrôles UI."""
async def target_spell(page,lane=0,uid=None):
    if uid is not None:
        await page.locator(f'[data-action="spell-target"][data-unit-id="{uid}"]').click()
    elif await page.locator('[data-action="spell-lane"]').count():
        await page.locator(f'.spell-lanes button[data-action="spell-lane"][data-lane="{lane}"]').click()
    await page.locator('[data-action="spell-confirm"]').click()
