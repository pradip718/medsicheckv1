precision mediump float;
varying mediump vec2 vtexcoord;
attribute mediump vec4 position;
attribute mediump vec2 texcoord;

// as input
// Assuming you have your shader program ID
// int rotationUniform = glGetUniformLocation(shaderProgramId, "rotationAngle");
// uniform float rotationAngle;

// Define pi
const float PI = 3.14159265359;

void main()
{
	float rotationAngle =  PI/2.0;
	mat2 rotationMatrix = mat2(cos(rotationAngle), -sin(rotationAngle), sin(rotationAngle), cos(rotationAngle));
	vec2 rotatedPosition = rotationMatrix * position.xy;
	gl_Position = vec4(rotatedPosition, position.z, position.w);
	vtexcoord = texcoord;
}