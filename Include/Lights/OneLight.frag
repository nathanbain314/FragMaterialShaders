#include "Light.frag"

#define NUM_LIGHTS 1
Light lights[NUM_LIGHTS];

#group Light

uniform vec3 Color; color[1.0,1.0,1.0]
uniform vec3 Position; slider[(-10,-10,-10),(2,2,2),(10,10,50)]
uniform float Radius; slider[0.000001,0.5,10.0]
uniform float Intensity; slider[0.0,1.0,100000.0]

void initLights()
{
  lights[0] = Light(Color*Intensity,Position,Radius);
}