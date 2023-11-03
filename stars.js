
const { mergeMap, range, interval, map, toArray } = rxjs;

export const starStream = (height, width) => {
    const SPEED = 40
    const STAR_NUMBER = 250

    //const starStream$ =
    return range(1, STAR_NUMBER)
        .pipe(
            map(() => ({

                x: parseInt(Math.random() * width, 10),
                y: parseInt(Math.random() * height, 10),
                size: Math.random() * 4 + 1

            })),
            toArray(),
            mergeMap(stars => interval(SPEED)
                .pipe(
                    map(() => {
                        stars.forEach(item => {
                            if (item.y >= height) {
                                item.y = 0

                            }

                            item.y += item.size
                        });

                        return stars
                    })
                )
            )
        )
}
