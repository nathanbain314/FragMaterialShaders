#include "Node.frag"

Shader shaders[1];
Node nodes[1];

uniform float Roughness; slider[0,0,1]
uniform float Anisotropy; slider[0,0,1]

void initMaterial()
{
  shaders[0] = Shader( 3, vec3(1.0), false, Roughness, 1.0, 1.0, vec3(1.0), 1.0, true, Anisotropy );

  nodes[0] = Node( 0, 0, 0, 0, 0.0 );
}