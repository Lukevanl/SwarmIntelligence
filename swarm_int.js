// SET BOID SIZE
let num_boid = 50
// let boid_size = Array.from({length: num_boid}, () => Math.floor(Math.random() * 30 + 10));
// let 
// let 
let num_in_checkpoint = 0
const MAX_MEASUREMENTS = 250
let checkpoint_measuresments = []

let Scene = {
    w: 700, h: 1200, swarm: [],
    neighbours: function (x) {
        let r = []
        for (let p of this.swarm) {
            if (dist(p.pos.x, p.pos.y, x.x, x.y) <= 100) {
                r.push(p)
            }
        }
        return r
    },
    distanceToCenter: function (p) {
        // Calculate the distance to the center line of the racetrack
        let x = p.x
        let y = p.y
        let y_coor = max(300, min(700, y))
        let x_coor = 300

        return abs(dist(x, y, x_coor, y_coor))
    },
    wrap: function (x) {
        if (x.x < 0) x.x += this.w
        if (x.y < 0) x.y += this.h
        if (x.x >= this.w) x.x -= this.w
        if (x.y >= this.h) x.y -= this.h
    }
}

class Particle {
    constructor() {
        this.pos = createVector(random(0, Scene.w),
            random(0, Scene.h))
        this.size = random(20,50)
        this.dir = p5.Vector.random2D()
        this.checkpoint_info = [] // This array holds the values of the number of birds
        this.strength = random(1, 3)
        this.inv_cohesion_strength = this.size / 0.2
        this.inv_separation_strength = 8 / this.size
    }
    step() {
        let N = 0, avg_sin = 0, avg_cos = 0, avg_p = createVector(0, 0), avg_d = createVector(0, 0)
        for (let n of Scene.neighbours(this.pos)) {
            avg_p.add(n.pos)
            if (n != this) {
                let away = p5.Vector.sub(this.pos, n.pos)
                away.div(this.inv_separation_strength * away.magSq())
              // away.add(p5.Vector(-0.1*this.size, -0.1*this.size))
                avg_d.add(away)
            }
            avg_sin += Math.sin(n.dir.heading())
            avg_cos += Math.cos(n.dir.heading())
            N++
        }
        avg_sin /= N; avg_cos /= N;
        avg_p.div(N); avg_d.div(N); avg_d.mult(30)
        // Alignment 
        // let avg_angle = createVector(0,0)
        let avg_angle = Math.atan2(avg_sin, avg_cos)
        avg_angle += random(-0.25, 0.25)
        let dir_r = createVector(0, 0)

        // Make sure the boids stay on track
        let distanceBar = Scene.distanceToCenter(this.pos)
        let dir_change = 1.5
        if (distanceBar > (250 - this.size)) {
            let x_dir = 0
            let y_dir = 0

            if (this.pos.x > (300 - this.size)) {
                x_dir = -dir_change
            }
            else {
                x_dir = dir_change
            }

            if (this.pos.y <= 300) {
                y_dir = dir_change
            }
            else if (this.pos.y >= 700) {
                y_dir = -dir_change
            }
            dir_r = createVector(x_dir, y_dir)
        }
        else if (distanceBar < (100 + this.size)) {
            let x_dir = 0
            let y_dir = 0
            if (this.pos.x >= 300) {
                x_dir = dir_change
            }
            else {
                x_dir = -dir_change
            }

            if (this.pos.y <= 300) {
                y_dir = -dir_change
            }
            else if (this.pos.y >= 700) {
                y_dir = dir_change
            }

            dir_r = createVector(x_dir, y_dir)
        }

        // Guide it clockwise 
        dir_change = 0.3
        let dir_c = createVector(0, 0)
        if (this.pos.y < 700 && this.pos.x >= 300) {
            // Top right
            dir_c = createVector(0, dir_change)
        }
        else if (this.pos.y >= 700 && this.pos.x >= 300) {
            // Bottom right
            dir_c = createVector(-0.66*dir_change, 0.33*dir_change)
        }
        else if (this.pos.y >= 300 && this.pos.x < 300) {
            // Bottom left
            dir_c = createVector(0, -dir_change)
        }
        else if (this.pos.y < 300 && this.pos.x < 300) {
            // Top Left
            dir_c = createVector(0.66*dir_change, -0.33*dir_change)
        }

        // Check if the bird is in the checkpoint
        if (this.pos.x < 300 && this.pos.y > 400 && this.pos.y < 600) {
            // num_in_checkpoint++
            num_in_checkpoint += this.size
        }
    
        // this.dir = p5.Vector.fromAngle(avg_angle)
        let cohesion = p5.Vector.sub(avg_p, this.pos)
        // this.dir.mult(random(1, this.strength))
        this.dir.mult(random(0, 1))
        cohesion.div(this.inv_cohesion_strength)
        // Cohesion
        // this.dir.add(cohesion)
        // Separation
        // this.dir.add(avg_d)
        
        this.dir.add(dir_r)
        this.dir.add(dir_c)

        this.pos.add(this.dir)
        Scene.wrap(this.pos)
    }

    draw() {
        fill(250)
        ellipse(this.pos.x, this.pos.y, this.size, this.size)
    }

    checkpoint() {
        // In this function we keep track of all the checkpoint related information
        if (this.pos.x < 300 && this.pos.y > 400 && this.pos.y < 600) {
            this.checkpoint_info.push(num_in_checkpoint)
        }
        else {
            if (this.checkpoint_info.length > 0) {
                let t = this.checkpoint_info.length
                let nr_b = this.checkpoint_info.reduce((a, b) => a + b, 0) / t;
                checkpoint_measuresments.push({ 't': t, 'nr_b': nr_b })
                //console.log(t)
                //console.log(nr_b)
                this.checkpoint_info = []
            }
        }
    }
}


function setup() {
    createCanvas(700, 1200);
    for (let i = 0; i < num_boid; i++) {
        Scene.swarm.push(new Particle())
    }
}

function draw() {
    clear()
    // Outer circle (Track)
    fill(90);
    rect(50, 300, 500, 400);
    arc(300, 300, 500, 500, PI, TWO_PI);
    arc(300, 700, 500, 500, TWO_PI, PI);

    // Inner circle
    fill(220);
    rect(200, 300, 200, 400);
    arc(300, 300, 200, 200, PI, TWO_PI);
    arc(300, 700, 200, 200, TWO_PI, PI);

    // Checkpoint Area
    fill(255);
    rect(50, 400, 150, 200);

    // Center line
    fill(100)
    rect(299, 300, 1, 400);

    num_in_checkpoint = 0
    for (let p of Scene.swarm) {
        p.step()
        p.draw()
    }
    for (let p of Scene.swarm) {
        p.checkpoint()
    }

    if (checkpoint_measuresments.length > MAX_MEASUREMENTS) {
        console.log(checkpoint_measuresments)
        checkpoint_measuresments = []
    }
}
