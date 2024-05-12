#include "Node.frag"

Shader shaders[3];
Node nodes[6];

void initMaterial()
{
  shaders[0] = Shader( 2, vec3(1.0), false, 0.0, 1.5, 0.05, vec3(0.995,0.1,0.1), 0.001, false, 0.0 );
  shaders[1] = Shader( 2, vec3(1.0), false, 0.0, 1.5, 0.05, vec3(0.1,0.995,1.0), 0.001, false, 0.0 );
  shaders[2] = Shader( 0, vec3(1.0), false, 0.0, 1.0, 1.0, vec3(1.0), 1.0, true, 0.0 );

  nodes[0] = Node( -1, 1, 4, 0, 0.5 );

  nodes[1] = Node( -1, 2, 3, 1, 1.5 );
  nodes[2] = Node( 0, 0, 0, 0, 0.0 );
  nodes[3] = Node( 2, 0, 0, 0, 0.0 );

  nodes[4] = Node( -1, 5, 3, 1, 1.5 );
  nodes[5] = Node( 1, 0, 0, 0, 0.0 );
}