/**
 * @param placement - current placement
 * @returns available navigation links filtered by current application placement.
 * `(for now there's no placements except main, but the may appear later)`
 * @see BXApiService.placement
 */
 const nav = (placement: string) => placement === 'DEFAULT'
 ? [
    {to: '/settings', label: 'nav.settings'},
    {to: '/tasks', label: 'nav.tasks'},
    {to: '/matching', label: 'nav.matching'},
 ]
 : [
    {to: '/europace', label: 'nav.europace'},
 ]

export default nav
