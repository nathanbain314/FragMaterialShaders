#donotrun
#include "3D.frag"
#include "Sunsky.frag"
#group Post
// Available when using exr image filename extention
uniform bool DepthToAlpha; checkbox[false];
// for rendering depth to alpha channel in EXR images, set in DE-Raytracer.frag
// see http://www.fractalforums.com/index.php?topic=21759.msg87160#msg87160
bool depthFlag = true; // do depth on the first hit not on reflections
#group Raytracer
// Distance to object at which raymarching stops.
uniform float Detail; slider[-7,-2.3,0]
// Lower this if the system is missing details
uniform float FudgeFactor; slider[0,1,1]
uniform float FudgeFactor2; slider[0,1,1]
float minDist = pow(10.0,Detail);
// Maximum number of raymarching steps.
uniform int MaxRaySteps; slider[0,100,100000]
vec4 orbitTrap = vec4(10000.0);
#group Light
#group Coloring
float DE(vec3 pos) ; // Must be implemented in other file
#ifdef providesNormal
vec3 normal(vec3 pos, float normalDistance);
#else
vec3 normal(vec3 pos, float normalDistance) {
    normalDistance = max(normalDistance*0.5, 1.0e-7);
    vec3 e = vec3(0.0,normalDistance,0.0);
    vec3 n = vec3(DE(pos+e.yxx)-DE(pos-e.yxx),
                  DE(pos+e.xyx)-DE(pos-e.xyx),
                  DE(pos+e.xxy)-DE(pos-e.xxy));
    n = normalize(n);
    return n;
}
#endif
#group Coloring
// This is the pure color of object (in white light)
uniform vec3 BaseColor; color[1.0,1.0,1.0]
// Determines the mix between pure light coloring and pure orbit trap coloring
uniform float OrbitStrength; slider[0,0,1]
// Closest distance to YZ-plane during orbit
uniform vec4 X; color[-1,0.7,1,0.5,0.6,0.6]
// Closest distance to XZ-plane during orbit
uniform vec4 Y; color[-1,0.4,1,1.0,0.6,0.0]
// Closest distance to XY-plane during orbit
uniform vec4 Z; color[-1,0.5,1,0.8,0.78,1.0]
// Closest distance to origin during orbit
uniform vec4 R; color[-1,0.12,1,0.4,0.7,1.0]
uniform bool CycleColors; checkbox[false]
uniform float Cycles; slider[0.1,1.1,32.3]

uniform bool UseGradientFile; checkbox[false]
uniform float ColorMultiplier; slider[0,0,1000]
uniform sampler2D Gradient; file[Gradients/default.png]

#group Raytracer
#define PI 3.14159265358979323846264

uniform bool DebugLast; checkbox[false]
uniform bool Stratify; checkbox[false]
uniform int RayDepth; slider[0,5,500] Locked
uniform float Albedo; slider[0,1,1]

vec2 seed = viewCoord*(float(subframe)+1.0);

float rand3(vec2 co) {
// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 rand2n() {
    seed+=vec2(-1,1);
    return rand2(seed);
}

float rand21() {
//    return rand3(viewCoord*(float(subframe)+1.0));
    seed+=vec2(-1,1);
    return rand3(seed);
}

vec3 ortho(vec3 v) {
// See : http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
    return abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y);
}
vec2 cx=
    vec2(
        floor(mod(float(subframe)*1.0,10.)),
        floor(mod(float(subframe)*0.1,10.))
    )/10.0;

vec3 getSampleBiased(vec3 dir, float power) {
    dir = normalize(dir);
// create orthogonal vector
    vec3 o1 = normalize(ortho(dir));
    vec3 o2 = normalize(cross(dir, o1));
// Convert to spherical coords aligned to dir;
    vec2 r = rand2n();
    if (Stratify) {
        r*=0.1;
        r+= cx;
        cx = mod(cx + vec2(0.1,0.9),1.0);
    }
    r.x=r.x*2.*PI;
// This is cosine^n weighted.
// See, e.g. http://people.cs.kuleuven.be/~philip.dutre/GI/TotalCompendium.pdf
// Item 36
    r.y=pow(r.y,1.0/(power+1.0));
    float oneminus = sqrt(1.0-r.y*r.y);
    vec3 sdir = cos(r.x)*oneminus*o1+
                sin(r.x)*oneminus*o2+
                r.y*dir;
    return sdir;
}

vec3 getConeSample(vec3 dir, float extent) {
// Create orthogonal vector (fails for z,y = 0)
    dir = normalize(dir);
    vec3 o1 = normalize(ortho(dir));
    vec3 o2 = normalize(cross(dir, o1));
// Convert to spherical coords aligned to dir
    vec2 r = rand2n();
    if (Stratify) {
        r*=0.1;
        r+= cx;
    }
    r.x=r.x*2.*PI;
    r.y=1.0-r.y*extent;
    float oneminus = sqrt(1.0-r.y*r.y);
    return cos(r.x)*oneminus*o1+sin(r.x)*oneminus*o2+r.y*dir;
}
vec3 cycle(vec3 c, float s) {
    return vec3(0.5)+0.5*vec3(cos(s*Cycles+c.x),cos(s*Cycles+c.y),cos(s*Cycles+c.z));
}

#ifdef providesColor
vec3 baseColor(vec3 point, vec3 normal);
#endif

bool outOfRange( vec3 hit )
{
  if( hit.x < -100.0 || hit.x > 100.0 )
    return true;
  if( hit.y < -100.0 || hit.y > 100.0 )
    return true;
  if( hit.z < -100.0 || hit.x > 100.0 )
    return true;
  return false;
}

uniform sampler2D EnvironmentMap; file[Ditch-River_2k.hdr]
uniform bool WhiteBackground; checkbox[false]
uniform float RotateMap; slider[0.00,0,6.28]
uniform bool BiasedSampling; checkbox[true]
uniform bool DirectLight; checkbox[true]
uniform bool ClampColor; checkbox[true]
uniform bool UseRussianRoulette; checkbox[true]
uniform bool InvisibleLight; checkbox[true]
uniform bool UseSky; checkbox[true]
uniform bool AlternateBackground; checkbox[false]
uniform vec3 BackgroundColor; color[0.0,0.0,0.0]

// Uses Russian Roulette algorithm to cut off some branches of monte carlo algorithm for more efficient rendering
bool RussianRoulette( inout vec3 throughput, int depth )
{
  if( depth < 5 )
  {
    return false;
  }

  float p = max( throughput.x, max( throughput.y, throughput.z ) );

  if( rand21() > p )
  {
    return true;
  }

  throughput *= 1.0/p;
  return false;
}

struct Interaction
{
  int hitID;
  vec3 hit;
  vec3 hitNormal;
  vec3 dir;
};

// Distance to center of sphere
float SphereDE( vec3 pos, int ID )
{
  pos -= lights[ID].p;
  return max( 0.0, length(pos) - lights[ID].r );
}

vec2 opU(vec2 o1, vec2 o2) {
    return (o1.x < o2.x) ? o1 : o2;
}

vec2 map(vec3 p, bool skipLight)
{
  vec2 result = vec2( DE(p), -1 );

  if( !skipLight )
  {
    for( int i = 0; i < NUM_LIGHTS; ++i )
    {
      result = opU( result, vec2(SphereDE(p,i), i) );
    }
  }

  return result;
}

// Trace until it hits an object, or until it is out of range of the fractal
bool traceOutside( vec3 from, vec3 dir, inout Interaction inter, bool skipLight ) {
    vec3 direction = normalize(dir);
    vec3 hit;
    float eps = minDist;
    float dist = 1000.0;

    float totalDist = 0.0;
    vec2 m;
    
    for ( int steps = 0; steps<MaxRaySteps && dist > eps; steps++) {
      hit = from + totalDist * direction;

      m = map( hit, skipLight );
      dist = m.x * FudgeFactor;

      totalDist += dist*FudgeFactor2;

      if( outOfRange(hit) )
      {
        return false;
      }
    }

    if(depthFlag) {
      // do depth on the first hit not on reflections
      depthFlag=false;
      // for rendering depth to alpha channel in EXR images
      // see http://www.fractalforums.com/index.php?topic=21759.msg87160#msg87160
      if(DepthToAlpha==true) gl_FragDepth = 1.0/totalDist;
      else
      // sets depth for spline path occlusion
      // see http://www.fractalforums.com/index.php?topic=16405.0
      // gl_FragDepth = ((1000.0 / (1000.0 - 0.00001)) +
      // (1000.0 * 0.00001 / (0.00001 - 1000.0)) /
      // clamp(totalDist, 0.00001, 1000.0));
      gl_FragDepth = (1.0 + (-1e-05 / clamp (totalDist, 1e-05, 1000.0)));
    }

    if (dist < eps) {
        if( m.y < 0.0 )
        {
          orbitTrap.y = orbitTrap.x;

          inter.hitID = -1;
          inter.hit = from + (totalDist-eps) * direction;
          inter.hitNormal = normal(hit, eps);
          inter.dir = dir;

          return true;
        }
        else
        {
          inter.hitID = int(m.y);
          return false; 
        }
    }

    return false;
}

vec3 getColor();

// Trace inside the fractal, using random walk subsurface scattering 
bool traceInsideScatter( vec3 from, vec3 dir, inout Interaction inter, inout vec3 throughput, float scatteringDistance, vec3 absorptionColor, float absorptionAtDistance, bool DontScatter ) {
    float m_scatteringCoefficient = 1.0 / scatteringDistance;
    vec3 m_absorptionCoefficient = -log(absorptionColor) / absorptionAtDistance;

    vec3 direction = normalize(dir);
    vec3 hit;
    float eps = minDist;
    float dist = 0.0;

    float totalDist = 0.0;
    
    for ( int steps = 0; steps<MaxRaySteps && dist < eps; steps++) {
      float distance = -log(rand21()) / m_scatteringCoefficient;

      hit = from + distance * direction;
      dist = DE(hit) * FudgeFactor;

      if( DontScatter || dist > eps )
      {
        distance = 0.0;
        hit = from;
        dist = DE(hit) * FudgeFactor;
        
        while( dist < eps )
        {
          distance += eps;

          hit = from + distance * direction;
          dist = DE(hit) * FudgeFactor;
        }
      }
      else
      {
        vec3 dir2 = vec3(0.0);
        if( rand21() < 0.5 )
          dir2.x = -1.0;
        else
          dir2.x = 1.0;
        direction = normalize(getSampleBiased(dir2,0.0));
      }

      vec3 transmission = exp(-m_absorptionCoefficient * distance);

      throughput = throughput * transmission;

      from = hit;

      if( outOfRange(from) )
      {
        return false;
      }

      if( UseRussianRoulette && steps > 5 )
      {
        if( RussianRoulette( throughput, steps ) )
        {
          return false;
        }
      }
    }

    if(depthFlag) {
      // do depth on the first hit not on reflections
      depthFlag=false;
      // for rendering depth to alpha channel in EXR images
      // see http://www.fractalforums.com/index.php?topic=21759.msg87160#msg87160
      if(DepthToAlpha==true) gl_FragDepth = 1.0/totalDist;
      else
      // sets depth for spline path occlusion
      // see http://www.fractalforums.com/index.php?topic=16405.0
      // gl_FragDepth = ((1000.0 / (1000.0 - 0.00001)) +
      // (1000.0 * 0.00001 / (0.00001 - 1000.0)) /
      // clamp(totalDist, 0.00001, 1000.0));
      gl_FragDepth = (1.0 + (-1e-05 / clamp (totalDist, 1e-05, 1000.0)));
    }

    if (dist > eps)
    {
      inter.hitID = -1;
      inter.hit = from;
      inter.hitNormal = normal(from, eps);
      inter.dir = direction;
      return true;
    }
    
    return false;
}

vec3 equirectangularMap(sampler2D sampler, vec3 dir) {
  // Convert (normalized) dir to spherical coordinates.
  dir = normalize(dir);
  vec2 longlat = vec2(atan(dir.y,dir.x)+RotateMap,acos(dir.z));
  // Normalize, and lookup in equirectangular map.
  return texture2D(sampler,longlat/vec2(2.0*PI,PI)).xyz;
}

vec3 getBackground(vec3 dir) {
  return WhiteBackground ? vec3(1.0) : equirectangularMap(EnvironmentMap,dir);
}

vec3 getColor() {
  vec3 color;
  if( UseGradientFile )
  {
    float colorIteration = orbitTrap.y;
    while( colorIteration < 1024.0 ) colorIteration += 1024.0;

    colorIteration *= ColorMultiplier;
    float index = mod(floor(colorIteration),1024.0);
    float index2 = mod(floor(colorIteration+1.0),1024.0);

    color = mix(texture2D(Gradient,vec2(index/1024.0,0.0)).xyz, texture2D(Gradient,vec2(index2/1024.0,0.0)).xyz, fract(colorIteration));
  }
  else
  {
    orbitTrap.w = sqrt(orbitTrap.w);
    vec3 orbitColor;
    if (CycleColors) {
        orbitColor = cycle(X.xyz,orbitTrap.x)*X.w*orbitTrap.x +
                     cycle(Y.xyz,orbitTrap.y)*Y.w*orbitTrap.y +
                     cycle(Z.xyz,orbitTrap.z)*Z.w*orbitTrap.z +
                     cycle(R.xyz,orbitTrap.w)*R.w*orbitTrap.w;
    } else {
        orbitColor = X.xyz*X.w*orbitTrap.x +
                     Y.xyz*Y.w*orbitTrap.y +
                     Z.xyz*Z.w*orbitTrap.z +
                     R.xyz*R.w*orbitTrap.w;
    }

    color = mix(BaseColor, 3.0*orbitColor,  OrbitStrength);
  }
  return color;
}

// Fresnel reflection
float fresnel( vec3 I, vec3 N, float ior )
{
  float cosi = dot(I, N); 
  float etai = 1.0, etat = ior; 
  if (cosi > 0.0)
  {
    etai = etat;
    etat = 1.0;
  } 
  // Compute sini using Snell's law
  float sint = etai / etat * sqrt(max(0.0, 1.0 - cosi * cosi)); 
  // Total internal reflection
  if (sint >= 1.0)
  { 
      return 1.0; 
  } 
  else
  { 
      float cost = sqrt(max(0.0, 1.0 - sint * sint)); 
      cosi = abs(cosi); 
      float Rs = ((etat * cosi) - (etai * cost)) / ((etat * cosi) + (etai * cost)); 
      float Rp = ((etai * cosi) - (etat * cost)) / ((etai * cosi) + (etat * cost)); 
      return (Rs * Rs + Rp * Rp) / 2.0; 
  } 
  return 1.0;
}

float facing( vec3 I, vec3 N, float blend )
{
  return 1.0 - pow(abs(dot(N,I)), 2.0*blend);
}

void reflectDir( inout vec3 dir, vec3 hit, vec3 hitNormal )
{
  dir=normalize(reflect(dir,hitNormal));
}

// Diffuse shader
void Diffuse( inout vec3 color, inout vec3 direct, vec3 throughput, inout vec3 dir, vec3 hit, vec3 hitNormal, vec3 ShaderColor, bool UseBaseColor )
{
  if( UseBaseColor )
  {
    #ifdef providesColor
    color *= baseColor(hit, hitNormal);
    #else
    color *= getColor();
    #endif 
  }
  else
  {
    color *= ShaderColor;
  }

  if  (!BiasedSampling) {
    // Unbiased sampling:
    // PDF = 1/(2*PI), BRDF = Albedo/PI
    dir = getConeSample( hitNormal,1.0);
    // modulate color with: BRDF*CosAngle/PDF
    color *= 2.0*Albedo*max(0.0,dot(dir,hitNormal));
  }
  else
  {
    // Biased sampling (cosine weighted):
    // PDF = CosAngle / PI, BRDF = Albedo/PI
    dir = getSampleBiased( hitNormal, 1.0 );
    
    // modulate color  with: BRDF*CosAngle/PDF
    color *= Albedo;
  }

  // Direct
  if ( UseSky && DirectLight )
  {
    vec3 d = hit+ hitNormal*3.0*minDist;
    vec3 sunSampleDir = getConeSample(sunDirection, 1.0-sunAngularDiameterCos);
    int c = 0;
    float sunLight = dot(hitNormal, sunSampleDir);
    Interaction a;
    if (sunLight>0.0 && !traceOutside(d,sunSampleDir,a,true))
    {
      direct += throughput*color*sun(sunSampleDir)*sunLight *1E-5;
    }
  }
  if( DirectLight )
  {
    for( int i = 0; i < NUM_LIGHTS; ++i )
    {
      float len = length( lights[i].p - hit );
      float cosT = 1.0 - len / sqrt( lights[i].r * lights[i].r + len * len );

      vec3 d = hit+ hitNormal*3.0*minDist;
      vec3 lightSampleDir = getConeSample( normalize( lights[i].p - d ), cosT );
      int c = 0;
      float lightIntensity = dot(hitNormal, lightSampleDir);
      Interaction a;
      traceOutside(d,lightSampleDir,a,false);

      if (lightIntensity>0.0 && a.hitID == i )
      {
        direct += throughput*color*lights[i].color*lightIntensity * cosT / 2.0;// *1E-5;
      }
    }
  }
}

// Glossy shader
void Glossy( inout vec3 color, inout vec3 dir, vec3 hit, vec3 hitNormal, vec3 ShaderColor, bool UseBaseColor, float Roughness )
{
  if( Roughness > 0.0 )
  {
    hitNormal = getConeSample( hitNormal,Roughness);
  }

  reflectDir( dir, hit, hitNormal );

  if( UseBaseColor )
  {
    #ifdef providesColor
    color *= baseColor(hit, hitNormal);
    #else
    color *= getColor();
    #endif 
  }
  else
  {
    color *= ShaderColor;
  }
}

// Glass shader
void Glass( inout vec3 color, inout vec3 dir, vec3 hit, vec3 hitNormal, vec3 ShaderColor, bool UseBaseColor, float Roughness, inout bool isRefract, float RefractionIndex )
{
  if( Roughness > 0.0 )
  {
    hitNormal = getConeSample( hitNormal,Roughness);
  }

  float eta = isRefract ? RefractionIndex : 1.0/RefractionIndex;

  if(isRefract) hitNormal = -hitNormal;
  vec3 dir2 = refract(normalize(dir),normalize(hitNormal),eta);
  if( length(dir2) > 0.0 )
  {
    dir = normalize(dir2);
    isRefract = !isRefract;
  }
  else
  {
    reflectDir( dir, hit, hitNormal );
  }

  if( UseBaseColor )
  {
    #ifdef providesColor
    color *= baseColor(hit, hitNormal);
    #else
    color *= getColor();
    #endif 
  }
  else
  {
    color *= ShaderColor;
  }
}

float pow2(float x) { 
    return x*x;
}

vec3 sphericalDirection(float sinTheta, float cosTheta, float sinPhi, float cosPhi) {
    return vec3(sinTheta * cosPhi, sinTheta * sinPhi, cosTheta);
}

float pdfMicrofacetAniso( vec3 wi, vec3 wo, vec3 X, vec3 Y, vec3 hitNormal, float Roughness, float Anisotropy ) {
    if (dot(wo, hitNormal) * dot(wi, hitNormal) <= 0.0) return 0.;

    vec3 wh = normalize(wo + wi);
    
    float aspect = sqrt(1.-Anisotropy*.9);
    float alphax = max(.001, pow2(Roughness)/aspect);
    float alphay = max(.001, pow2(Roughness)*aspect);
    
    float alphax2 = alphax * alphax;
    float alphay2 = alphax * alphay;

    float hDotX = dot(wh, X);
    float hDotY = dot(wh, Y);
    float NdotH = dot(hitNormal, wh);
    
    float denom = hDotX * hDotX/alphax2 + hDotY * hDotY/alphay2 + NdotH * NdotH;
    if( denom == 0. ) return 0.;
    float pdfDistribution = NdotH /(PI * alphax * alphay * denom * denom);
    return pdfDistribution/(4. * dot(wo, wh));
}

// Anisotropic Shader
void Anisotropic( inout vec3 color, inout vec3 direct, inout vec3 throughput, inout vec3 dir, vec3 hit, vec3 hitNormal, vec3 ShaderColor, bool UseBaseColor, float Roughness, float Anisotropy )
{
  vec3 X = cross(hitNormal, vec3(1.,0.,1.));
  vec3 Y = normalize(cross(hitNormal, X));
  X = normalize(cross(hitNormal,Y));

  vec2 u = rand2n();
  float cosTheta = 0., phi = 0.;
  
  float aspect = sqrt(1. - Anisotropy*.9);
  float alphax = max(.001, pow2(Roughness)/aspect);
  float alphay = max(.001, pow2(Roughness)*aspect);
  
  phi = atan(alphay / alphax * tan(2. * PI * u.y + .5 * PI));
  
  if (u.y > .5) phi += PI;
  float sinPhi = sin(phi), cosPhi = cos(phi);
  float alphax2 = alphax * alphax, alphay2 = alphay * alphay;
  float alpha2 = 1. / (cosPhi * cosPhi / alphax2 + sinPhi * sinPhi / alphay2);
    float tanTheta2 = alpha2 * u.x / (1. - u.x);
  cosTheta = 1. / sqrt(1. + tanTheta2);
  
  float sinTheta = sqrt(max(0., 1. - cosTheta * cosTheta));
  vec3 whLocal = sphericalDirection(sinTheta, cosTheta, sin(phi), cos(phi));
       
  vec3 wh = whLocal.x * X + whLocal.y * Y + whLocal.z * hitNormal;
  
  if( dot(dir, hitNormal) * dot(wh, hitNormal) <= 0.0 )
  {
     wh *= -1.;
  }
          
  dir = reflect(-dir, wh);


bool UseSky = true;
bool DirectLight = true;

  // Direct
  if ( UseSky && DirectLight )
  {
    vec3 d = hit+ hitNormal*3.0*minDist;
    vec3 sunSampleDir = getConeSample(sunDirection, 1.0-sunAngularDiameterCos);
    int c = 0;
//    float sunLight = dot(hitNormal, sunSampleDir);
    float sunLight = dot(hitNormal, sunSampleDir)*pdfMicrofacetAniso( dir, sunSampleDir, X, Y, hitNormal, Roughness, Anisotropy );
    Interaction a;
    if (sunLight>0.0 && !traceOutside(d,sunSampleDir,a,true))
    {
      direct += throughput*color*sun(sunSampleDir)*sunLight *1E-5;
    }
  }
  if( DirectLight )
  {
    for( int i = 0; i < NUM_LIGHTS; ++i )
    {
      float len = length( lights[i].p - hit );
      float cosT = 1.0 - len / sqrt( lights[i].r * lights[i].r + len * len );

      vec3 d = hit+ hitNormal*3.0*minDist;
      vec3 lightSampleDir = getConeSample( normalize( lights[i].p - d ), cosT );
      int c = 0;
//      float lightIntensity = dot(hitNormal, lightSampleDir);
      float lightIntensity = dot(hitNormal, lightSampleDir)*pdfMicrofacetAniso( dir, lightSampleDir, X, Y, hitNormal, Roughness, Anisotropy );
      Interaction a;
      traceOutside(d,lightSampleDir,a,false);

      if (lightIntensity>0.0 && a.hitID == i )
      {
        direct += throughput*color*lights[i].color*lightIntensity * cosT / 2.0;// *1E-5;
      }
    }
  }




  if( UseBaseColor )
  {
    #ifdef providesColor
    color *= baseColor(hit, hitNormal);
    #else
    color *= getColor();
    #endif 
  }
  else
  {
    color *= ShaderColor;
  }
}

int chooseNextShader( vec3 dir, vec3 hitNormal )
{
  int n = 0;

  while( nodes[n].ShaderID < 0 )
  {
    if( nodes[n].WeightType == 0 )
    {
      if( rand21() > nodes[n].Weight )
      {
        n = nodes[n].NodeID1;
      }
      else
      {
        n = nodes[n].NodeID2;
      }
    }
    else if( nodes[n].WeightType == 1 )
    {
      if( rand21() > fresnel( dir, hitNormal, nodes[n].Weight ) )
      {
        n = nodes[n].NodeID1;
      }
      else
      {
        n = nodes[n].NodeID2;
      }
    }
    else if( nodes[n].WeightType == 2 )
    {
      if( rand21() > facing( dir, hitNormal, nodes[n].Weight ) )
      {
        n = nodes[n].NodeID1;
      }
      else
      {
        n = nodes[n].NodeID2;
      }
    }
  }

  return nodes[n].ShaderID;
}

vec3 color(vec3 from, vec3 dir)
{
  initMaterial();
  initLights();

  vec3 color = vec3(1.0);
  vec3 direct = vec3(0.0);
  vec3 throughput = vec3(1.0);

  Interaction inter = Interaction( 0, vec3(0.0), vec3(0.0), vec3(0.0));

  bool isRefract = false;

  int refractionShader = 0;

  depthFlag=true; // do depth on the first hit not on reflections

  for( int i=0; i < RayDepth; i++ )
  {
    bool didHit = false;

    inter.hitID = -2;

    if( isRefract )
    {
      didHit = traceInsideScatter(from,dir,inter,throughput,shaders[refractionShader].scatteringDistance,shaders[refractionShader].absorptionColor,shaders[refractionShader].absorptionAtDistance,shaders[refractionShader].DontScatter);
    }
    else
    {
      didHit = traceOutside(from,dir,inter, InvisibleLight && i == 0 );
    }

    if( didHit )
    {
      dir = inter.dir;

      int nextShader = chooseNextShader( dir, inter.hitNormal );

      // Diffuse
      if( shaders[nextShader].ShaderType == 0 )
      {
        Diffuse( color, direct, throughput, dir, inter.hit, inter.hitNormal, shaders[nextShader].ShaderColor, shaders[nextShader].UseBaseColor );
      }
      // Glossy
      else if( shaders[nextShader].ShaderType == 1 )
      {
        Glossy( color, dir, inter.hit, inter.hitNormal, shaders[nextShader].ShaderColor, shaders[nextShader].UseBaseColor, shaders[nextShader].Roughness );
      }
      // Glass
      else if( shaders[nextShader].ShaderType == 2 )
      {
        Glass( color, dir, inter.hit, inter.hitNormal, shaders[nextShader].ShaderColor, shaders[nextShader].UseBaseColor, shaders[nextShader].Roughness, isRefract, shaders[nextShader].RefractionIndex );
        refractionShader = nextShader;
      }
      else if( shaders[nextShader].ShaderType == 3 )
      {
        Anisotropic( color, direct, throughput, dir, inter.hit, inter.hitNormal, shaders[nextShader].ShaderColor, shaders[nextShader].UseBaseColor, shaders[nextShader].Roughness, shaders[nextShader].Anisotropy );
      }
    }
    else
    {
      if (DebugLast && i!=RayDepth-1)
      {
        return vec3(0.0);
      }

      if( isRefract )
      {
        return vec3(0.0);
      }

      if( inter.hitID >= 0 )
      {
        direct += throughput * color * lights[inter.hitID].color;
      }

      if( AlternateBackground && i == 0 )
      {
        return BackgroundColor;
      }

      if( UseSky )
      {
        if (!DirectLight)
        {
          color = throughput * color * sunsky(dir);
        }
        else
        {
          color = direct + throughput * color * (i>0 ? sky(dir) : sunsky(dir));
        }
      }
      else
      {
        if (!DirectLight)
        {
          color = throughput * color * getBackground( dir );
        }
        else
        {
          color = direct + throughput * color * getBackground( dir );
        }
      }

      if( ClampColor )
      {
        return clamp ( color, 0.0, 1.0);
      }
      else
      {
        return color;
      }
    }

    // Choose new starting point for ray

    if( isRefract )
    {
      inter.hitNormal = -inter.hitNormal;
    }

    from = inter.hit + inter.hitNormal * minDist * 8.0;
  }

  return vec3(0.0);
}
