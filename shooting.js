
const { takeWhile,
    mergeMap,
    interval,
    distinctUntilChanged,
    map,
    timestamp,
    scan,
    sampleTime,
    startWith,
    fromEvent,
    filter,
    combineLatest,
    merge } = rxjs


export const heroFireing = (spaceship$) => {

    const shoots$ = merge(

        fromEvent(document, 'click'),
        fromEvent(document, 'keydown').pipe(filter(e => e.keyCode === 32))

    ).pipe(
        startWith(false),
        sampleTime(200),
        timestamp()
    )


    return combineLatest({
        spaceship: spaceship$,
        shoots: shoots$,
    }).pipe(
        distinctUntilChanged((prev, cur) => cur.shoots.timestamp === prev.shoots.timestamp),
        filter(item => item.shoots.value),

        map(item => {
            const point = { x: item.spaceship.x, y: item.spaceship.y }
            return {
                id: item.shoots.timestamp,
                expired: false,
                points: [point],
                point
            }
        }),

        mergeMap(shot => interval(20).pipe(

            takeWhile(() => shot.point.y > 0 && !shot.expired),
            map(() => {
                shot.point.y -= 7
                return shot
            }),
        )),

        scan((acc, item) => {

            acc[item.id] ??= { expired: false, points: [], point: item.point }

            if (acc[item.id].expired !== true && acc[item.id].point.y > 0) {
                acc[item.id].points.push(item.point)
                acc[item.id].point = item.point
            }
            else {

                acc[item.id].point = { x: -10, y: -1 }
            }

            return acc
        }, {}),

        map(s => {

            return Object.keys(s).filter(key => !s[key].expired).reduce((acc, key) => {
                acc[key] = s[key]
                return acc
            }, {})

        }),

        startWith({})
    )
}
