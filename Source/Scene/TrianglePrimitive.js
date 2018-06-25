define([
	"../Renderer/DrawCommand",
	"../Core/Matrix4",
	"../Scene/Material",
	"../Renderer/Buffer",
	"../Renderer/BufferUsage",
	"../Core/ComponentDatatype",
	"../Renderer/ShaderProgram",
	"../Renderer/RenderState",
	"../Core/PrimitiveType",
	"../Scene/CullFace",
	"../Renderer/Pass",
	"../Core/BoundingSphere",
	"../Core/IndexDatatype",
	"../Core/Cartesian3",
	"../Renderer/VertexArray"
], function(
	DrawCommand,
	Matrix4,
	Material,
	Buffer,
	BufferUsage,
	ComponentDatatype,
	ShaderProgram,
	RenderState,
	PrimitiveType,
	CullFace,
	Pass,
	BoundingSphere,
	IndexDatatype,
	Cartesian3,
	VertexArray
) { 
	"use strict";

	function TrianglePrimitive(options) {
		var options=options || {};
		this._dirty = true;
		this._positions = options.positions || new Cartesian3();
		this._vertices = [];
		this._colors = [];
		this._show = options.show || true;
		this._material = Material.fromType(Material.ColorType);
		this._modelMatrix = Matrix4.clone(Matrix4.IDENTITY);
		this._drawCommand = new DrawCommand({
			owner: this
		});
		this._drawLineCommand=undefined;
	}

	TrianglePrimitive.prototype.update = function(frameState) {
		if (!this._show) {
			return;
		}
		var context = frameState.context;
		this.vertexArray = (this._dirty || !this.vertexArray) ? this.createVertexArray(context) : this.vertexArray;
		this.setupShaderProgram(context);
		this.setupRenderState();

		var passes = frameState.passes;
		if (passes.render) {
			this.setupDrawCommand();
			frameState.commandList.push(this._drawCommand);
		}

	};

	TrianglePrimitive.prototype.updateHintLine = function() {

		//顶点数组对象
		var vertexArray = new VertexArray({
			context: W,
			attributes: Y,
			indexBuffer: j
		});
		var W = r.context,
		if (defined(this._drawLineCommand)) {
			this._drawLineCommand.vertexArray.destroy();
			this._drawLineCommand.vertexArray = X;
			this._drawLineCommand.modelMatrix = this._modelMatrix;
			this._drawLineCommand.boundingVolume = A;
		} else {
			var shaderProgram = ShaderProgram.fromCache({
				context: W,
				vertexShaderSource: "attribute vec3 position;\n" +
					"uniform mat4 u_modelViewMatrix;\n" +
					"void main()\n{\n" +
					"gl_Position = czm_projection* u_modelViewMatrix* vec4(position.xyz,1.0);\n" +
					"}",
				fragmentShaderSource: "uniform vec4 u_bgColor;\n" +
					"void main()\n{\n" +
					"gl_FragColor = u_bgColor;\n" +
					"}\n"
			});
			var renderState = RenderState.fromCache({
				depthTest: {
					enabled: false
				}
			});
			K = this;
			var uniformMap = {
				u_bgColor: function() {
					return Color.YELLOW
				},
				u_modelViewMatrix: function() {
					return W.uniformState.modelView
				}
			};
			this._drawLineCommand = new DrawCommand({
				boundingVolume: A,
				modelMatrix: K._modelMatrix,
				primitiveType: PrimitiveType.LINES,
				vertexArray: X,
				shaderProgram: shaderProgram,
				castShadows: !1,
				receiveShadows: !1,
				uniformMap: uniformMap,
				renderState: renderState,
				pass: Pass.OPAQUE
			})
		}
	}
	TrianglePrimitive.prototype.sceneModeChanged = function(mode) {
		return this._lastMode !== mode;
	};
	TrianglePrimitive.prototype.createVertexArray = function(context) {
		this._dirty = false;
		for (var i = 0; i < this._positions.length; i++) {
			var position = this._positions[i];
			this._vertices.push(position.x);
			this._vertices.push(position.y);
			this._vertices.push(position.z);
			this._colors.push(Math.random());
			this._colors.push(Math.random());
			this._colors.push(Math.random());
		}
		var positionVertexBuffer = Buffer.createVertexBuffer({
			context: context,
			typedArray: new Float32Array(this._vertices),
			usage: BufferUsage.STATIC_DRAW
		});

		var colorVertexBuffer = Buffer.createVertexBuffer({
			context: context,
			typedArray: new Float32Array(this._colors),
			usage: BufferUsage.STATIC_DRAW
		});

		var attributes = [{
			index: 0,
			enabled: true,
			vertexBuffer: positionVertexBuffer,
			componentsPerAttribute: 3,
			componentDatatype: ComponentDatatype.FLOAT,
			normalize: false,
			offsetInBytes: 0,
			strideInBytes: 0
		}, {
			index: 1,
			enabled: true,
			vertexBuffer: colorVertexBuffer,
			componentsPerAttribute: 3,
			componentDatatype: ComponentDatatype.FLOAT,
			normalize: false,
			offsetInBytes: 0,
			strideInBytes: 0
		}];

		var vertexArray = new VertexArray({
			context: context,
			attributes: attributes,
			indexBuffer: this.createIndexBuffer(context)
		});
		return vertexArray;
	};
	TrianglePrimitive.prototype.setupShaderProgram = function(context) {
		this._shaderProgram = this._shaderProgram || ShaderProgram.replaceCache({
			context: context,
			shaderProgram: this._shaderProgram,
			vertexShaderSource: "attribute vec3 position;\n" +
				"attribute vec3 color;\n" +
				"varying vec4 v_color;\n\n" +
				"void main() {\n" +
				"gl_Position = czm_modelViewProjection * vec4(position, 1.0);\n" +
				"v_color = vec4(color,1.0);\n" +
				"}",
			fragmentShaderSource: "varying vec4 v_color;\n" +
				"void main(){\n" +
				"gl_FragColor = v_color;\n" +
				"}"
		});
	};
	TrianglePrimitive.prototype.setupRenderState = function() {
		this._renderState = RenderState.fromCache({
			cull: {
				enabled: true,
				face: CullFace.FRONT
			},
			depthTest: {
				enabled: false
			},
			depthMask: true,
			blending: undefined
		});
	};
	TrianglePrimitive.prototype.setupDrawCommand = function() {
		this._drawCommand.modelMatrix = this._modelMatrix;
		this._drawCommand.renderState = this._renderState;
		this._drawCommand.primitiveType = PrimitiveType.TRIANGLES;
		this._drawCommand.shaderProgram = this._shaderProgram;
		this._drawCommand.vertexArray = this.vertexArray;
		this._drawCommand.pass = Pass.OVERLAY;
		this._drawCommand.boundingVolume = this.createBoundingVolume();
		this._drawCommand.debugShowBoundingVolume = false;
	};
	TrianglePrimitive.prototype.createIndexBuffer = function(context) {
		this._indicesArray = TrianglePrimitive.createIndicesArray(this._vertices.length);

		this._indexBufferArray = Buffer.createIndexBuffer({
			context: context,
			typedArray: this._indicesArray,
			usage: BufferUsage.STATIC_DRAW,
			indexDatatype: IndexDatatype.UNSIGNED_SHORT
		});
	};
	TrianglePrimitive.createIndicesArray = function(size) {
		var indicesArray = [];
		for (var i = 0; i < size / 3; i++) {
			indicesArray.push(i);
		}
		return new Uint16Array(indicesArray);
	};
	TrianglePrimitive.prototype.createBoundingVolume = function() {
		return BoundingSphere.fromPoints(this._positions);
	};

	return TrianglePrimitive;

});