#include "Node.frag"

Shader shaders[2];
Node nodes[3];

void initMaterial()
{
  shaders[0] = Shader( 2, vec3(1.0), false, 0.0, 1.5, 0.05, vec3(0.1,0.995,1.0), 0.001, false, 0.0 );
  shaders[1] = Shader( 0, vec3(1.0), false, 0.0, 1.0, 1.0, vec3(1.0), 1.0, true, 0.0 );

  nodes[0] = Node( -1, 1, 2, 1, 1.5 );
  nodes[1] = Node( 0, 0, 0, 0, 0.0 );
  nodes[2] = Node( 1, 0, 0, 0, 0.0 );
}