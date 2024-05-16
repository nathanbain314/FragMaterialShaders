# FragMaterialShaders
This project adds a path tracing fragment shader for use with rendering fractals in Fragmentarium.
It allows for custom shaders to be created blending multiple materials and nodes together.

Fractals can be rendered with materials built out of one or more nodes.
Nodes reference either a shader, or mulitple nodes that are blended together.

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

## Examples
**Anisotropic**
![Anisotropic](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Anisotropic.png?raw=true)
**Ceramic**
![Ceramic](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Ceramic.png?raw=true)
**Chocolate**
![Chocolate](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Chocolate.png?raw=true)
**Clay**
![Clay](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Clay.png?raw=true)
**Crystal**
![Crystal](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Crystal.png?raw=true)
**Crystal2**
![Crystal2](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Crystal2.png?raw=true)
**Crystal3**
![Crystal3](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Crystal3.png?raw=true)
**Diffuse**
![Diffuse](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Diffuse.png?raw=true)
**Diffuse Base Color**
![DiffuseBase](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/DiffuseBase.png?raw=true)
**Glass**
![SmoothGlass](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/SmoothGlass.png?raw=true)
**Rough Glass**
![Glass](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Glass.png?raw=true)
**Glossy**
![Glossy](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Glossy.png?raw=true)
**Gold**
![Gold](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Gold.png?raw=true)
**Jade**
![Jade](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Jade.png?raw=true)
**Plastic**
![Plastic](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Plastic.png?raw=true)
**Rubber**
![Rubber](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Rubber.png?raw=true)
**Wax**
![Wax](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Wax.png?raw=true)
## Lego
By modifying a distance estimator and using a plastic material, any fractal can be made to look as though it was made of building blocks.
**Lego**
![Lego](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Lego.png?raw=true)
**Lego2**
![Lego2](https://github.com/nathanbain314/FragMaterialShaders/blob/b07904cab85a8f5d955c09e6672f727ff4a109fd/Examples/Lego2.png?raw=true)
