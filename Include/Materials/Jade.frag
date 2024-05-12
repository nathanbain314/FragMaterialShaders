#include "Node.frag"

Shader shaders[3];
Node nodes[6];

void initMaterial()
{
  shaders[0] = Shader( 0, vec3(0.698, 1, 0.616), false, 0.0, 1.0, 1.0, vec3(1.0), 1.0, true, 0.0 );
  shaders[1] = Shader( 1, vec3(1.0), false, 0.001, 1.0, 1.0, vec3(1.0), 1.0, true, 0.0 );
  shaders[2] = Shader( 2, vec3(1.0), false, 0.0, 1.66, 0.01, vec3(0.949, 1, 0.918), 0.1, false, 0.0 );

  nodes[0] = Node( -1, 1, 2, 0, 0.391 );
  nodes[1] = Node( -1, 3, 4, 0, 0.03 );
  nodes[2] = Node(  2, 0, 0, 0, 0.0 );
  nodes[3] = Node( -1, 5, 4, 1, 1.66 );
  nodes[4] = Node(  1, 0, 0, 0, 0.0 );
  nodes[5] = Node(  0, 0, 0, 0, 0.0 );
}