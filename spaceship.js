const { merge, scan, fromEvent, map, filter, startWith } = rxjs

export const shipStream = (canvas) => {

    const START_POSITION = { x: canvas.width / 2 - 32, y: canvas.height - 150 }

    return merge(

        fromEvent(document, 'mousemove').pipe(map(e => ({ x: e.clientX, y: START_POSITION.y }))),

        fromEvent(document, 'keydown')
            .pipe(

                map(e => e.keyCode),
                filter(v => v === 37 || v === 39),

                scan((position, v) => {

                    position.x += v === 39 && 10 || -10
                    position.x = (position.x + 16 > canvas.width) ? 0 : position.x
                    position.x = (position.x < 0) ? canvas.width - 16 : position.x

                    return position

                }, START_POSITION),
                startWith(START_POSITION)
            ))
}