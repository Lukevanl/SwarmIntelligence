import json
import numpy as np

with open('normal.json') as json_file:
    data = json.load(json_file)

import matplotlib.pyplot as plt

fd_points_speed = []
fd_points_density = []

for dictionary in data:
    time = dictionary['t']
    density = dictionary['nr_b']
    fd_points_speed.append(1/time)
    fd_points_density.append(density)
    
plt.scatter(fd_points_density, fd_points_speed)
a, b = np.polyfit(fd_points_density, fd_points_speed, 1)
print(a)
plt.plot(np.array(fd_points_density), a*np.array(fd_points_density)+b)
plt.ylabel('speed')
plt.xlabel('density')
plt.show()
