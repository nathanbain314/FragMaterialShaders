#include "Node.frag"

Shader shaders[3];
Node nodes[5];

void initMaterial()
{
  shaders[0] = Shader( 0, vec3(0.769, 0.353, 0.02), false, 0.0, 1.0, 1.0, vec3(1.0), 1.0, true, 0.0 );
  shaders[1] = Shader( 0, vec3(0.996, 0.675, 0.463), false, 0.0, 1.0, 1.0, vec3(1.0), 1.0, true, 0.0 );
  shaders[2] = Shader( 1, vec3(0.996, 0.675, 0.463), false, 0.4, 1.0, 1.0, vec3(1.0), 1.0, true, 0.0 );

  nodes[0] = Node( -1, 1, 2, 1, 1.3 );
  nodes[1] = Node( -1, 3, 4, 2, 0.7 );
  nodes[2] = Node( 2, 0, 0, 0, 0.0 );
  nodes[3] = Node( 0, 0, 0, 0, 0.0 );
  nodes[4] = Node( 1, 0, 0, 0, 0.0 );
}