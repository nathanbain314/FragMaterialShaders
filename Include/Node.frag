struct Node
{
  int ShaderID; // 0 = Diffuse, 1 = Glossy, 2 = Glass

  int NodeID1;
  int NodeID2;
  int WeightType; // 0 = use weight, 1 = fresnel, 2 = facing
  float Weight;
};

struct Shader
{
  // Specifies shader
  int ShaderType;

  // For all shaders
  vec3 ShaderColor;
  bool UseBaseColor;
  
  // For glossy and glass shaders
  float Roughness;
  
  // Glass
  float RefractionIndex;
  float scatteringDistance;
  vec3 absorptionColor;
  float absorptionAtDistance;
  bool DontScatter;

  // Anisotropy
  float Anisotropy;
};