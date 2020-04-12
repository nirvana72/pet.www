var RENDERER = {
	POINT_INTERVAL : 5,
	FISH_COUNT : 2,
	MAX_INTERVAL_COUNT : 50,
	INIT_HEIGHT_RATE : 0.5, // 高度的一半
	
	init : function(){
		this.setParameters();// 参数初始化
		this.reconstructMethods();// bind方法解决this指向问题
		this.setup();
		this.bindEvent(); // 绑定窗体大小变化事件，鼠标进入影响事件， 鼠标事件已注销
		this.render();
  },
  // 参数初始化
	setParameters : function(){
		this.$window = $(window);
		this.$container = $('#datouwang');
    this.$canvas = $('<canvas />');    
    this.context = this.$canvas.appendTo(this.$container).get(0).getContext('2d');
    this.fish = document.getElementById("fish");
		this.points = [];
		this.fishes = [];
		this.watchIds = [];
  },
  // 把宽度按5像素等分，每等分加一个SURFACE_POINT 对象，并设置前后引用
	createSurfacePoints : function(){
    var count = Math.round(this.width / this.POINT_INTERVAL);    
    this.pointInterval = this.width / (count - 1);
		this.points.push(new SURFACE_POINT(this, 0));
		
		for(var i = 1; i < count; i++){
			var point = new SURFACE_POINT(this, i * this.pointInterval),
				previous = this.points[i - 1];
				
			point.setPreviousPoint(previous);
			previous.setNextPoint(point);
			this.points.push(point);
		}
  },
  // bind方法解决this指向问题
	reconstructMethods : function(){
		this.watchWindowSize = this.watchWindowSize.bind(this);
		this.jdugeToStopResize = this.jdugeToStopResize.bind(this);
		this.startEpicenter = this.startEpicenter.bind(this);
		this.moveEpicenter = this.moveEpicenter.bind(this);
		this.render = this.render.bind(this);
	},
	setup : function(){
		this.points.length = 0;
		this.fishes.length = 0;
		this.watchIds.length = 0;
		this.intervalCount = this.MAX_INTERVAL_COUNT;
		this.width = this.$container.width();
    this.height = this.$container.height();
		this.fishCount = this.FISH_COUNT * this.width / 500 * this.height / 500; // 每500x500区域两条鱼
		this.$canvas.attr({width : this.width, height : this.height}); // 画布长宽
		
		this.skyGradient = this.context.createLinearGradient(0, 0, 0, this.height); // 天际线 颜色渐变过渡
		this.skyGradient.addColorStop(0, 'hsl(180, 80%, 90%)'); // hsl 色调, 饱和度, 亮度
		this.skyGradient.addColorStop(1, 'hsl(180, 80%, 60%)');
		
		this.seaGradient = this.context.createLinearGradient(0, 0, 0, this.height); // 海际线
		this.seaGradient.addColorStop(0, 'hsl(180, 80%, 60%)');
		this.seaGradient.addColorStop(0.5, 'hsl(180, 80%, 50%)');
		this.seaGradient.addColorStop(1, 'hsl(210, 80%, 50%)');
		
		this.fishes.push(new FISH(this)); // 加一条鱼， 不加也没事
		this.createSurfacePoints();
	},
	watchWindowSize : function(){
		this.clearTimer();
		this.tmpWidth = this.$window.width();
		this.tmpHeight = this.$window.height();
		this.watchIds.push(setTimeout(this.jdugeToStopResize, this.WATCH_INTERVAL));
	},
	clearTimer : function(){
		while(this.watchIds.length > 0){
			clearTimeout(this.watchIds.pop());
		}
	},
	jdugeToStopResize : function(){
		var width = this.$window.width(),
			height = this.$window.height(),
			stopped = (width == this.tmpWidth && height == this.tmpHeight);
			
		this.tmpWidth = width;
		this.tmpHeight = height;
		
		if(stopped){
			this.setup();
		}
	},
	bindEvent : function(){
		this.$window.on('resize', this.watchWindowSize);
	  // this.$container.on('mouseenter', this.startEpicenter);
		// this.$container.on('mousemove', this.moveEpicenter);
	},
	getAxis : function(event){
		var offset = this.$container.offset();
		
		return {
			x : event.clientX - offset.left + this.$window.scrollLeft(),
			y : event.clientY - offset.top + this.$window.scrollTop()
		};
	},
	startEpicenter : function(event){
		this.axis = this.getAxis(event);
	},
	moveEpicenter : function(event){
		var axis = this.getAxis(event);
		
		if(!this.axis){
			this.axis = axis;
		}
		this.points[Math.round(axis.x / this.pointInterval)].interfere(axis.y, axis.y - this.axis.y);
		this.axis = axis;
  },
  // 鱼在水平面时， 计算出当前位置的波浪点作动画
	generateEpicenter : function(x, y, prevX, prevY){
		var index = Math.round(x / this.pointInterval);
		
		if(index < 0 || index >= this.points.length){
			return;
		}
		this.points[index].interfere(y, y - prevY);
	},
	render : function(){
		requestAnimationFrame(this.render);
		this.context.fillStyle = this.skyGradient;
		this.context.fillRect(0, 0, this.width, this.height);
		this.context.fillStyle = this.seaGradient;
		this.context.beginPath();
		this.context.moveTo(0, this.height);
		
		for(let i = 0, count = this.points.length; i < count; i++){
			this.points[i].updateSelf();
		}
		for(let i = 0, count = this.points.length; i < count; i++){
			this.points[i].updateNeighbors();
		}
		for(let i = 0, count = this.points.length; i < count; i++){
			this.points[i].render(this.context);
		}
		this.context.lineTo(this.width, this.height);
		this.context.closePath();
		this.context.fill();
		
		for(let i = 0, count = this.fishes.length; i < count; i++){
			this.fishes[i].render(this.context);
		}
		if(this.fishes.length < this.fishCount){
			if(--this.intervalCount == 0){
				this.intervalCount = this.MAX_INTERVAL_COUNT;
				this.fishes.push(new FISH(this));
			}
		}
	}
};
// 波浪
// renderer 主画布， x , x轴坐标
var SURFACE_POINT = function(renderer, x){
	this.renderer = renderer;
	this.x = x;
	this.init();
};
SURFACE_POINT.prototype = {
	SPRING_CONSTANT : 0.06, // 波浪高度
	SPRING_FRICTION : 0.9,  // 波浪大小
	WAVE_SPREAD : 0.2,
	ACCELARATION_RATE : 0.005,  //加速率
	
	init : function(){
		this.initHeight = this.renderer.height * this.renderer.INIT_HEIGHT_RATE; // 画布高度的一半
		this.height = this.initHeight;
		this.fy = 0;
		this.force = {previous : 0, next : 0};
	},
	setPreviousPoint : function(previous){
		this.previous = previous;
	},
	setNextPoint : function(next){
		this.next = next;
	},
	interfere : function(y, velocity){
		var offset = this.renderer.height - this.height - y;
		
		if(offset > 0 && velocity < 0 || offset < 0 && velocity > 0){
			return;
		}
		this.fy = this.renderer.height * this.ACCELARATION_RATE * (offset >= 0 ? -1 : 1) * Math.abs(velocity);
	},
	updateSelf : function(){    
		this.fy += this.SPRING_CONSTANT * (this.initHeight - this.height);
    this.fy *= this.SPRING_FRICTION;
    this.height += this.fy;    
	},
	updateNeighbors : function(){
		if(this.previous){
			this.force.previous = this.WAVE_SPREAD * (this.height - this.previous.height);
		}
		if(this.next){
			this.force.next = this.WAVE_SPREAD * (this.height - this.next.height);
		}
	},
	render : function(context){
		if(this.previous){
			this.previous.height += this.force.previous;
			this.previous.fy += this.force.previous;
		}
		if(this.next){
			this.next.height += this.force.next;
			this.next.fy += this.force.next;
		}
		context.lineTo(this.x, this.renderer.height - this.height);
	}
};
var FISH = function(renderer){
	this.renderer = renderer;
	this.init();
};
FISH.prototype = {
	LENGTH : 20,
	GRAVITY : 0.5,
	
	init : function(){
		this.direction = Math.random() < 0.5;
		this.x = this.direction ? (this.renderer.width + this.LENGTH) : -this.LENGTH;
		this.y = this.getRandomValue(this.renderer.height * 6 / 10, this.renderer.height * 9 / 10);
		this.prevX = this.x;
		this.prevY = this.y;
		this.vx = this.getRandomValue(4, 8) * (this.direction ? -1 : 1); //方向
		this.vy = this.getRandomValue(-5, -2); // 角度
    this.ay = this.getRandomValue(-0.2, -0.05); // 仰伸角度
    this.size = this.getRandomValue(0.8, 1.2);  //随机大小
		this.theta = 0;
		this.phi = 0;
		this.isOut = false;
	},
	getRandomValue : function(min, max){
		return min + (max - min) * Math.random();
	},
	render : function(context){
		context.save();
		context.translate(this.x, this.y); // 初始位置
		context.rotate(Math.PI + Math.atan2(this.vy, this.vx)); // 旋转角度
		context.scale(this.size, this.direction ? this.size : -1 * this.size); // 方向 及 缩放
    /*
    context.drawImage(this.renderer.fish, this.vx, this.vy);
    context.restore();
    */ 
    //画鱼身
    context.fillStyle = 'hsl(180, 30%, 80%)';
		context.beginPath();
		context.moveTo(-30, 0);
		context.bezierCurveTo(-20, 15, 15, 10, 40, 0);
		context.bezierCurveTo(15, -10, -20, -15, -30, 0);
		context.fill();    
    // 鱼尾
		context.save();
		context.translate(40, 0);
		context.scale(0.9 + 0.1 * Math.sin(this.theta), 1);
		context.fillStyle = 'hsl(180, 30%, 80%)';
		context.beginPath();
		context.moveTo(0, 0);
		context.quadraticCurveTo(5, 10, 20, 8);
		context.quadraticCurveTo(12, 5, 10, 0);
		context.quadraticCurveTo(12, -5, 20, -8);
		context.quadraticCurveTo(5, -10, 0, 0);
		context.fill();
		context.restore();
		// 鱼翅
		context.save();
		context.translate(-3, 0);
    context.rotate(Math.PI / 3 + Math.PI / 20 * Math.sin(this.phi));
    context.scale(0.6, 0.6);
		context.fillStyle = 'hsl(220, 80%, 40%)';
		context.beginPath();
		context.moveTo(-5, 0);
		context.bezierCurveTo(-10, -10, -10, -30, 0, -40);
		context.bezierCurveTo(12, -25, 8, -10, 0, 0);
		context.closePath();
		context.fill();
		context.restore();
		// 大眼圈
		context.strokeStyle = 'hsl(220, 80%, 40%)';
		context.beginPath();
		context.arc(-15, -3, 5, 0, Math.PI * 2, false);
		context.stroke();
		// 小眼圈
		context.fillStyle = 'hsl(220, 80%, 40%)';
		context.beginPath();
		context.arc(-15, -3, 3, 0, Math.PI * 2, false);
		context.fill();
		
		context.restore();
		
		this.prevX = this.x;
		this.prevY = this.y;
		
		this.x += this.vx;
		this.y += this.vy;
		
		this.vy += this.ay;    
    
		if(this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE){
      // 水面
			this.vy += this.GRAVITY;
			this.isOut = true;
		}else{
			if(this.isOut){
				this.ay = this.getRandomValue(-0.2, -0.05);
			}
			this.isOut = false;
    }
    // 鱼尾鱼翅摆动
		this.theta += Math.PI / 20;
		this.theta %= Math.PI * 2;
		this.phi += Math.PI / 10;
		this.theta %= Math.PI * 2;
		
		if(this.y > this.renderer.height * this.renderer.INIT_HEIGHT_RATE - this.LENGTH && this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE + this.LENGTH){
      // 在水平面时，波浪动画
			this.renderer.generateEpicenter(this.x + (this.direction ? -1 : 1) * this.LENGTH, this.y, this.prevX, this.prevY);
		}
		if(this.vx > 0 && this.x > this.renderer.width + this.LENGTH || this.vx < 0 && this.x < -this.LENGTH){
			this.init();
		}
	}
};
$(function(){
	RENDERER.init();
});