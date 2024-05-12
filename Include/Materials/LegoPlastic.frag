#include "Node.frag"

Shader shaders[2];
Node nodes[3];

void initMaterial()
{
  shaders[0] = Shader( 0, vec3(0.1803921568627451,0.396078431372549,0.8), true, 0.0, 1.0, 1.0, vec3(1.0), 1.0, true, 0.0 );
  shaders[1] = Shader( 1, vec3(0.35), false, 0.0005, 1.0, 1.0, vec3(1.0), 1.0, true, 0.0 );

  nodes[0] = Node( -1, 1, 2, 0, 0.3 );
  nodes[1] = Node( 0, 0, 0, 0, 0.0 );
  nodes[2] = Node( 1, 0, 0, 0, 0.0 );
}
