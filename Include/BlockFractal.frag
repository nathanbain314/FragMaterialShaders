#info Mandelbulb Distance Estimator
#define providesInit
#define providesColor

#include "MathUtils.frag"

#include "Materials/LegoPlastic.frag"
#include "Lights/None.frag"
#include "PathTracerMaterial.frag"

#group Mandelbulb

uniform float NumBricks; slider[0.1,1.0,1000.0]

// Number of fractal iterations.
uniform int Iterations;  slider[0,9,100]

// Number of color iterations.
uniform int ColorIterations;  slider[0,9,100]

// Mandelbulb exponent (8 is standard)
uniform float Power; slider[0,8,16]

// Bailout radius
uniform float Bailout; slider[0,5,30]

// mermelada's tweak Derivative bias
uniform float DerivativeBias; slider[0,1,2]

// Alternate is slightly different, but looks more like a Mandelbrot for Power=2
uniform bool AlternateVersion; checkbox[false]

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[0.00,0,180]

uniform bool Julia; checkbox[false]
uniform vec3 JuliaC; slider[(-2,-2,-2),(0,0,0),(2,2,2)]

//uniform float time;
mat3 rot;
void init() {
	 rot = rotationMatrix3(normalize(RotVector), RotAngle);
}

// This is my power function, based on the standard spherical coordinates as defined here:
// http://en.wikipedia.org/wiki/Spherical_coordinate_system
//
// It seems to be similar to the one Quilez uses:
// http://www.iquilezles.org/www/articles/mandelbulb/mandelbulb.htm
//
// Notice the north and south poles are different here.
void powN1(inout vec3 z, float r, inout float dr) {
	// extract polar coordinates
	float theta = acos(z.z/r);
	float phi = atan(z.y,z.x);
//	dr =  pow( r, Power-1.0)*Power*dr + 1.0;
// mermelada's tweak
	// http://www.fractalforums.com/new-theories-and-research/error-estimation-of-distance-estimators/msg102670/?topicseen#msg102670
	  dr =  max(dr*DerivativeBias,pow( r, Power-1.0)*Power*dr + 1.0);

	// scale and rotate the point
	float zr = pow( r,Power);
	theta = theta*Power;
	phi = phi*Power;

	// convert back to cartesian coordinates
	z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
}

// This is a power function taken from the implementation by Enforcer:
// http://www.fractalforums.com/mandelbulb-implementation/realtime-renderingoptimisations/
//
// I cannot follow its derivation from spherical coordinates,
// but it does give a nice mandelbrot like object for Power=2
void powN2(inout vec3 z, float zr0, inout float dr) {
	float zo0 = asin( z.z/zr0 );
	float zi0 = atan( z.y,z.x );
	float zr = pow( zr0, Power-1.0 );
	float zo = zo0 * Power;
	float zi = zi0 * Power;
//	dr = zr*dr*Power + 1.0;
// mermelada's tweak
	// http://www.fractalforums.com/new-theories-and-research/error-estimation-of-distance-estimators/msg102670/?topicseen#msg102670
	  dr = max(dr*DerivativeBias,zr*dr*Power + 1.0);
	zr *= zr0;
	z  = zr*vec3( cos(zo)*cos(zi), cos(zo)*sin(zi), sin(zo) );
}

float DE3(vec3 pos) {
	return max(0.0,length(pos)-1.0);
}

// Compute the distance from `pos` to the Mandelbox.
float DE2(vec3 pos) {
	pos.z = -pos.z;
	vec3 z=pos;
	float r;
	float dr=1.0;
	int i=0;
	r=length(z);
	while(r<Bailout && (i<Iterations)) {
		if (AlternateVersion) {
			powN2(z,r,dr);
		} else {
			powN1(z,r,dr);
		}
		z+=(Julia ? JuliaC : pos);
		r=length(z);
		z*=rot;
		if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,r*r)));
		i++;
	}
//	if ((type==1) && r<Bailout) return 0.0;
	return 0.5*log(r)*r/dr;
	/*
	Use this code for some nice intersections (Power=2)
	float a =  max(0.5*log(r)*r/dr, abs(pos.y));
	float b = 1000;
	if (pos.y>0)  b = 0.5*log(r)*r/dr;
	return min(min(a, b),
		max(0.5*log(r)*r/dr, abs(pos.z)));
	*/
}

float randOrbit;

bool IsInCube(vec3 pos)
{
	float hx = floor(pos.x*NumBricks)/NumBricks;
	float hy = floor(pos.y*NumBricks)/NumBricks;
	float hz = floor(pos.z/0.4*NumBricks)/NumBricks;

	float d2 = DE2(vec3(hx,hy,hz*0.4));

	if(d2 < minDist*0.1)
	{
		randOrbit = rand(vec3(hx,hy,hz));
		return true;
	}

	return false;
}

bool IsInCylinder(vec3 pos)
{
	float hx = floor(pos.x*NumBricks)/NumBricks;
	float hy = floor(pos.y*NumBricks)/NumBricks;
	float hz = floor(pos.z/0.4*NumBricks-1.0)/NumBricks;

	float nx = pos.x - hx - 0.5/NumBricks;
	float ny = pos.y - hy - 0.5/NumBricks;
	float nz = pos.z - hz*0.4;
	if(nz > 0.625/NumBricks) return false;

	float d3 = max(0.0,length(vec2(nx,ny))-0.3/NumBricks);

	if(d3 > minDist*0.1) return false;

	float d2 = DE2(vec3(hx,hy,hz*0.4));

	if(d2 < minDist*0.1)
	{
		randOrbit = rand(vec3(hx,hy,hz));
		return true;
	}

	return false;
}

float DE(vec3 pos) {
	float d2 = DE2(pos);

	//return d2;

	if(d2 > 2.0/NumBricks )
	{
		return d2;
	}
	if(IsInCube(pos) || IsInCylinder(pos))
	{
		return 0.0;
	}
	else
	{
		return 2.0*minDist;
	}
}

// Chooses a random color for the block
vec3 baseColor(vec3 pos, vec3 normal)
{
	if(randOrbit < 0.125)
	{
		return vec3(0.10588235294117647,0.16470588235294117,0.20392156862745098);
	}
	else if(randOrbit < 0.25)
	{
		return vec3(0.11764705882352941,0.35294117647058826,0.6588235294117647);
	}
	else if(randOrbit < 0.375)
	{
		return vec3(0,0.5215686274509804,0.16862745098039217);
	}
	else if(randOrbit < 0.5)
	{
		return vec3(0.7058823529411765,0,0);
	}
	else if(randOrbit < 0.625)
	{
		return vec3(0.5882352941176471,0.5882352941176471,0.5882352941176471);
	}
	else if(randOrbit < 0.75)
	{
		return vec3(0.9568627450980393,0.9568627450980393,0.9568627450980393);
	}
	else if(randOrbit < 0.875)
	{
		return vec3(0.9803921568627451,0.7843137254901961,0.0392156862745098);
	}
	else if(randOrbit < 1.0)
	{
		return vec3(0.37254901960784315,0.19215686274509805,0.03529411764705882);
	}
}

#preset Default
FOV = 0.62536
Eye = 1.65826,-1.22975,0.277736
Target = -5.2432,4.25801,-0.607125
Up = 0.401286,0.369883,-0.83588
EquiRectangular = false
FocalPlane = 1
Aperture = 0
Gamma = 2.08335
ToneMapping = 3
Exposure = 0.6522
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 2
Detail = -2.84956
DetailAO = -1.35716
FudgeFactor = 1
MaxRaySteps = 164
Dither = 0.51754
NormalBackStep = 1
AO = 0,0,0,0.85185
Specular = 1.6456
SpecularExp = 16.364
SpecularMax = 10
SpotLight = 1,1,1,1
SpotLightDir = 0.63626,0.5
CamLight = 1,1,1,1.53846
CamLightMin = 0.12121
Glow = 1,1,1,0.43836
GlowMax = 52
Fog = 0
HardShadow = 0.3538500
ShadowSoft = 12.5806
Reflection = 0.0
DebugSun = false
BaseColor = 1,1,1
OrbitStrength = 0.14286
X = 1,1,1,1
Y = 0.345098,0.666667,0,0.02912
Z = 1,0.666667,0,1
R = 0.0784314,1,0.941176,-0.0194
BackgroundColor = 0.607843,0.866667,0.560784
GradientBackground = 0.3261
CycleColors = false
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 12
ColorIterations = 8
Power = 8
Bailout = 6.279
AlternateVersion = true
RotVector = 1,1,1
RotAngle = 0
Julia = false
JuliaC = 0,0,0
#endpreset

#preset Octobulb
FOV = 0.62536
Eye = -0.184126,0.843469,1.32991
Target = 1.48674,-5.55709,-4.56665
Up = 0,1,0
AntiAlias = 1
Detail = -2.47786
DetailAO = -0.21074
FudgeFactor = 1
MaxRaySteps = 164
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.7
Specular = 1
SpecularExp = 27.082
SpotLight = 1,1,1,0.94565
SpotLightDir = 0.5619,0.18096
CamLight = 1,1,1,0.23656
CamLightMin = 0.15151
Glow = 0.415686,1,0.101961,0.18421
Fog = 0.60402
HardShadow = 0.7230800
Reflection = 0.0
BaseColor = 1,1,1
OrbitStrength = 0.62376
X = 0.411765,0.6,0.560784,-0.37008
Y = 0.666667,0.666667,0.498039,0.86886
Z = 0.666667,0.333333,1,-0.25984
R = 0.4,0.7,1,0.36508
BackgroundColor = 0.666667,0.666667,0.498039
GradientBackground = 0.5
CycleColors = true
Cycles = 7.03524
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 14
ColorIterations = 6
Power = 8.18304
Bailout = 6.279
AlternateVersion = true
RotVector = 1,0,0
RotAngle = 77.8374
#endpreset

