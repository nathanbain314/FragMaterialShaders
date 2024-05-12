#include "Light.frag"

#define NUM_LIGHTS 2
Light lights[NUM_LIGHTS];

#group Light

uniform vec3 Color; color[1.0,1.0,1.0]
uniform vec3 Position; slider[(-50,-50,-50),(0,0,0),(50,50,50)]
uniform float Radius; slider[0.000001,0.5,10.0]
uniform float Intensity; slider[0.0,1.0,100000.0]

uniform vec3 Color2; color[1.0,1.0,1.0]
uniform vec3 Position2; slider[(-50,-50,-50),(0,0,0),(50,50,50)]
uniform float Radius2; slider[0.000001,0.5,10.0]
uniform float Intensity2; slider[0.0,1.0,100000.0]

void initLights()
{
  lights[0] = Light(Color*Intensity,Position,Radius);
  lights[1] = Light(Color2*Intensity2,Position2,Radius2);
}