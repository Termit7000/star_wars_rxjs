

const { takeWhile, interval, scan, startWith } = rxjs

const ENEMIES_FREQ = 1500

export const enemies = (width, height) => interval(ENEMIES_FREQ)
    .pipe(

        scan((items) => {

            const enemy = {
                x: Math.floor(Math.random() * width / 64) * 64,
                y: Math.floor((Math.random() * height - 300) / 64) * 64,
                dead: false,
                shoots: []
            }

            if (enemy.x > 0 && enemy.y > 0 && !items.some(i => !i.dead && i.x === enemy.x && i.y === enemy.y)) {
                items.push(enemy)

                interval(3000)
                    .pipe(takeWhile(() => !(enemy.dead && enemy.shoots.length === 0))).subscribe(() => { //

                        if (!enemy.dead) {
                            enemy.shoots.push({ x: enemy.x, y: enemy.y + 64 })
                        }
                        enemy.shoots = enemy.shoots.filter(s => s.y < height)
                    })
            }
            return items
        }, [])

        , startWith([])
    )