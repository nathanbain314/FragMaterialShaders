#include "Node.frag"

Shader shaders[1];
Node nodes[1];

void initMaterial()
{
  shaders[0] = Shader( 1, vec3(1.0), false, 0.0, 1.0, 1.0, vec3(1.0), 1.0, true, 0.0 );

  nodes[0] = Node( 0, 0, 0, 0, 0.0 );
}