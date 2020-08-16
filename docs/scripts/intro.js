var ctx, canvas, wide, long;

var i = 0;
var txt = "enable the webcam and use your hand to capture the cows!";
var speed = 50;

window.onload = function()
{
	wide = window.innerWidth;
	long = window.innerLength;
	canvas = document.getElementById("something");
	ctx = canvas.getContext("2d");
	ctx.fillRect(0,0,canvas.width, canvas.height);
}

function  typeWriter()
{
	if (i < txt.length)
	{
		document.getElementById("instructions").innerHTML += txt.charAt(i);
		i++;
		setTimeout(typeWriter, speed);
	}
}