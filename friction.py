"""Plot distance over time, helps tune friction
coefficient & piece velocities."""

import matplotlib.pyplot as plt

TIMESTEPS_PER_SECOND = 30;
MILLIS_BETWEEN_TIMESTEPS = 1000/TIMESTEPS_PER_SECOND;
DT = MILLIS_BETWEEN_TIMESTEPS/1000.0;

def main():
    coefficients = [.4, .6, .8,]
    speeds = [80, 120, 200]
    timesteps = 1000

    for C in coefficients:
        for v in speeds:
            plot_course(C, v, timesteps)
    plt.grid(linestyle="--")
    plt.xlabel("time")
    plt.ylabel("distance")
    plt.legend()
    plt.show()

def plot_course(C, v0, timesteps):
    xs = []
    ys = []
    distance = 0
    v = v0
    for t in range(1, timesteps+1):
        xs.append(t)
        distance += DT * v
        v -= DT*(1-C)*v
        ys.append(distance)
    plt.plot(xs, ys, label=f"{C},{v0}")
    
if __name__ == "__main__":
    main()
