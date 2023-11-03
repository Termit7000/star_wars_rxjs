import { enemies } from "./enemies.js";
import { heroFireing } from "./shooting.js";
import { shipStream } from "./spaceship.js";
import { starStream } from "./stars.js";

const {
    fromEvent,
    map,
    sampleTime,
    startWith,
    takeWhile,
    combineLatest,
    filter,
    BehaviorSubject,
    scan
} = rxjs;

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

document.body.appendChild(canvas)

canvas.width = window.innerWidth * 0.9
canvas.height = window.innerHeight

const spaceShipImg = new Image()
spaceShipImg.src = 'starship.png'

const enemyImg = new Image()
enemyImg.src = 'enemy.png'

const POINT_ROUND = 17
const pointed = (shot, target) => Math.abs(target.x - shot.x) < POINT_ROUND && Math.abs(target.y - shot.y) < POINT_ROUND
const hited = (shot, enemies) => enemies.findIndex(enemy => !enemy.dead && pointed(shot, enemy))

const paintStars = (stars) => {
    ctx.fillStyle = '#626b78'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#fff'
    stars.forEach(item => ctx.fillRect(item.x, item.y, item.size, item.size))
}

const paintShip = (shipCoordinates) => ctx.drawImage(spaceShipImg, shipCoordinates.x - 32, shipCoordinates.y, 64, 64)
const paintEnemies = (enemies) => enemies.forEach(i => {

    i.shoots.forEach(s => {

        s.y += 5
        ctx.fillStyle = '#00f'
        ctx.fillRect(s.x - 3, s.y, 7, 11)
    })

    if (!i.dead) {

        const div = Math.random() * 2
        i.x += (Math.random() > .5) ? div : -1 * div
        i.y += 1

        ctx.drawImage(enemyImg, i.x - 32, i.y - 32, 64, 64)
    }

    if (i.x > canvas.width || i.y > canvas.height) {
        i.dead = true
    }

})

const paintFires = (shoots, enemies, score) => {

    ctx.fillStyle = '#fff'
    ctx.font = "48px serif";
    ctx.fillText(`Счет: ${score}`, 20, 68);

    Object
        .keys(shoots)
        .filter(key => !shoots[key].expired)
        .forEach(key => {

            const lastPoint = shoots[key].point
            const enemy = hited(lastPoint, enemies)

            shoots[key].expired = enemy != -1

            ctx.fillStyle = (shoots[key].expired) ? '#32a852' : '#f54275'
            ctx.fillRect(lastPoint.x, lastPoint.y, 7, 11)


            if (shoots[key].expired) {
                enemies[enemy].dead = true
                scoreSubject.next(1)
            }
        })
}

const renderGame = (assets) => {
    paintStars(assets.scene)
    paintShip(assets.spaceShip)
    paintEnemies(assets.enemies)
    paintFires(assets.heroFireing, assets.enemies, assets.score)
}

const gameOver = ({ spaceShip, enemies, heroFireing, stopGame }) => !enemies.some(e => {

    const isKilled = e.shoots.some(s => pointed(s, spaceShip)) || enemies.some(e => pointed(e, spaceShip))
    if (stopGame > 0) {
        console.log('hero: ', spaceShip, ' fireing: ', heroFireing, ' en: ', enemies)
    }
    return isKilled
})

const scoreSubject = new BehaviorSubject(0)
const ship$ = shipStream(canvas)
const enemies$ = enemies(canvas.width, canvas.height)

combineLatest({
    scene: starStream(canvas.height, canvas.width),
    spaceShip: ship$,
    enemies: enemies$,
    heroFireing: heroFireing(ship$),
    score: scoreSubject.pipe(scan((acc, i) => acc + i, 0)),
    stopGame: fromEvent(document, 'keydown').pipe(
        map(e => e.keyCode),
        filter(v => v === 80),
        startWith(0))
}).pipe(
    sampleTime(20),
    takeWhile(assets => gameOver(assets) && assets.stopGame !== 80))
    .subscribe(renderGame)



