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
	"../Renderer/VertexArray",
	"../Core/Color",
	"../Core/Resource",
	"../Core/buildModuleUrl",
	"./BOSData001"
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
	VertexArray,
	Color,
	Resource,
	buildModuleUrl,
	BOSData
) { 
	"use strict";

	function BOSPrimitive(options) {
		var options=options || {};
		this._dirty = true;
		// this._positions = options.positions || new Cartesian3();
		this._vertices = [];
		this._indices=[];
		this._colors = [];
		this._show = options.show || true;
		this._material = Material.fromType(Material.ColorType);
		this._modelMatrix = options.modelMatrix || Matrix4.clone(Matrix4.IDENTITY);
		// this._drawCommand = new DrawCommand({
		// 	owner: this
		// });
		this._nodeCommads=[];
		// this._drawLineCommand=undefined;
	}

	BOSPrimitive.prototype.update = function(frameState) {
		if (!this._show) {
			return;
		}
		var context = frameState.context;
		// this.vertexArray = (this._dirty || !this.vertexArray) ? this.createVertexArray(context) : this.vertexArray;
		this.setupShaderProgram(context);
		this.setupRenderState();
		
		this.vertexArray = (this._dirty || !this.vertexArray) ? this.createVertexArray(context) : this.vertexArray;
		var passes = frameState.passes;
		if (passes.render) {
			// this.setupDrawCommand(context);
			var nodeCommads=this._nodeCommads;
			for (var i = 0; i < nodeCommads.length; i++) {
				frameState.commandList.push(nodeCommads[i]);
			}
			// frameState.commandList.push(this._drawCommand);
		}

	};

	
	BOSPrimitive.prototype.sceneModeChanged = function(mode) {
		return this._lastMode !== mode;
	};

	var min = new Cartesian3(-500000, -500000, 0.0);
    var max = new Cartesian3( 500000,  500000, 0.0);

    function createCommand(scope,context,vertexArray,boundingSphere){
    	var nodeCommads=scope._nodeCommads;

    	var uniformMap = {
			u_bgColor: function() {
				return Color.YELLOW
			},
			u_modelViewMatrix: function() {
				return context.uniformState.modelView
			}
		};
		// this._drawCommand.modelMatrix = this._modelMatrix;
		// this._drawCommand.renderState = this._renderState;
		// this._drawCommand.primitiveType = PrimitiveType.TRIANGLES;
		// this._drawCommand.shaderProgram = this._shaderProgram;
		// this._drawCommand.vertexArray = this.vertexArray;
		// this._drawCommand.uniformMap=uniformMap;
		// this._drawCommand.pass = Pass.OVERLAY;
		// this._drawCommand.boundingVolume = this.createBoundingVolume();
		// this._drawCommand.debugShowBoundingVolume = true;

		
		var command = new DrawCommand({
			boundingVolume: boundingSphere, // updated in update()
			modelMatrix: scope._modelMatrix, // computed in update()
			primitiveType: PrimitiveType.TRIANGLES,
			vertexArray: vertexArray,
			shaderProgram: scope._shaderProgram,
			uniformMap: uniformMap,
			renderState: scope._renderState,
			owner: scope,
			pass: Pass.OVERLAY
		});
    	nodeCommads.push(command);
    }

	BOSPrimitive.prototype.createVertexArray = function(context) {
		this._dirty = false;
		console.log(BOSData);
		var _indices=[];
		var _vertices=[];
		var _colors=[];
		var positionsArray=[];
		for (var i = 0; i < BOSData.length; i++) {
			// if (BOSData[i].geoFKey) {
			// 	if (!(BOSData[i].type == "ifcspace" || BOSData[i].type == "IfcOpeningElement" || BOSData[i].type == "IfcMember")) {
					var geo = BOSData[i].geo;
					var CesiumMatrix = Matrix4.fromArray(BOSData[i].matrix);
					 // var CesiumMatrix = Cesium.Matrix4.fromArray(matrix);
      //               var positionsArray = [];
      //               for (var k = 0; k < positions.length; k += 3) {
      //                   // positionsArray.push(new Cesium.Cartesian3(positions[k], positions[k + 1], positions[k + 2]));
      //                   var result = Cesium.Matrix4.multiplyByPoint(CesiumMatrix, new Cesium.Cartesian3(positions[k], positions[k + 1], positions[k + 2]), new Cesium.Cartesian3());
      //                   positionsArray.push(result);
      //               }
					// for (var j = 0; j < geos.length; j++) {
						// var geo = geos[j];
						var positions = geo.positions;
						var indices = geo.indices;
						var colors = geo.colors;
						for (var k = 0; k < positions.length; k+=3) {
							var result = Matrix4.multiplyByPoint(CesiumMatrix, new Cartesian3(positions[k], positions[k + 1], positions[k + 2]), new Cartesian3());
							positionsArray.push(result);
							_colors.push(Math.random(),Math.random(),Math.random());
							// _vertices.push(100000 * updatepositions[k]); //Cesium.Cartesian3.multiplyByScalar()
						}
						Cartesian3.packArray(positionsArray,_vertices);
						for (var m = 0; m < indices.length; m++) {
							_indices.push(indices[m]);
						}

						// if(colors.length==0){
						// 	_colors.push(0.5,0.5,0.5);
						// }
						// for (var j = 0; j < colors.length-1; j++) {
						// 	_colors.push(colors[j]);
						// }
						// _colors.push(Math.random(),Math.random(),Math.random());

						//顶点Buffer
						var positionVertexBuffer = Buffer.createVertexBuffer({
							context: context,
							typedArray: new Float32Array(_vertices),
							usage: BufferUsage.STATIC_DRAW
						});

						//索引Buffer
						var indexBuffer = Buffer.createIndexBuffer({
							context: context,
							typedArray: new Uint32Array(_indices),
							usage: BufferUsage.STATIC_DRAW,
							indexDatatype: IndexDatatype.UNSIGNED_INT
						});

						var colorVertexBuffer = Buffer.createVertexBuffer({
							context: context,
							typedArray: new Float32Array(_colors),
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
							indexBuffer: indexBuffer
						});

						var points=Cartesian3.unpackArray(_vertices,[]);
						var boundingSphere=BoundingSphere.fromPoints(points);

						createCommand(this,context,vertexArray,boundingSphere);
					// }
					_indices=[];
					_vertices=[];
					_colors=[];
					positionsArray=[];
			// 	}

			// 	// }
			// }
		}
		// this._dirty = true;

		return "ff";

		// +z face
  //       this._vertices[0]  = min.x;
  //       this._vertices[1]  = min.y;
  //       this._vertices[2]  = 0.0;
  //       this._vertices[3]  = max.x;
  //       this._vertices[4]  = min.y;
  //       this._vertices[5]  = 0.0;
  //       this._vertices[6]  = max.x;
  //       this._vertices[7]  = max.y;
  //       this._vertices[8]  = 0.0;
  //       this._vertices[9]  = min.x;
  //       this._vertices[10] = max.y;
  //       this._vertices[11] = 0.0;

		// // for (var i = 0; i < this._positions.length; i++) {
		// // 	var position = this._positions[i];
		// // 	this._vertices.push(position.x);
		// // 	this._vertices.push(position.y);
		// // 	this._vertices.push(position.z);
		// // 	this._colors.push(Math.random());
		// // 	this._colors.push(Math.random());
		// // 	this._colors.push(Math.random());
		// // }
		//  // 2 triangles
  //           // indices = new Uint32Array(2 * 3);

  //        // var indices=
  //           // +z face
		// this._indices[0] = 0;
		// this._indices[1] = 1;
		// this._indices[2] = 2;
		// this._indices[3] = 0;
		// this._indices[4] = 2;
		// this._indices[5] = 3;

		//顶点Buffer
		// var positionVertexBuffer = Buffer.createVertexBuffer({
		// 	context: context,
		// 	typedArray: new Float32Array(this._vertices),
		// 	usage: BufferUsage.STATIC_DRAW
		// });

		// //索引Buffer
		// var indexBuffer = Buffer.createIndexBuffer({
		// 	context: context,
		// 	typedArray: new Uint32Array(this._indices),
		// 	usage: BufferUsage.STATIC_DRAW,
		// 	indexDatatype: IndexDatatype.UNSIGNED_INT
		// });

		// // var colorVertexBuffer = Buffer.createVertexBuffer({
		// // 	context: context,
		// // 	typedArray: new Float32Array(this._colors),
		// // 	usage: BufferUsage.STATIC_DRAW
		// // });

		// var attributes = [{
		// 	index: 0,
		// 	enabled: true,
		// 	vertexBuffer: positionVertexBuffer,
		// 	componentsPerAttribute: 3,
		// 	componentDatatype: ComponentDatatype.FLOAT,
		// 	normalize: false,
  //           offsetInBytes: 0,
  //           strideInBytes: 0
		// }];

		// var vertexArray = new VertexArray({
		// 	context: context,
		// 	attributes: attributes,
		// 	indexBuffer: indexBuffer
		// });
		// return vertexArray;
	};
	BOSPrimitive.prototype.setupShaderProgram = function(context) {
		this._shaderProgram = this._shaderProgram || ShaderProgram.replaceCache({
			context: context,
			shaderProgram: this._shaderProgram,
			vertexShaderSource: "attribute vec3 position;\n" +
				"uniform mat4 u_modelViewMatrix;\n" +
				"attribute vec3 color;\n"+
            	"varying vec4 v_color;\n\n"+
				"void main()\n{\n" +
				"gl_Position = czm_projection*u_modelViewMatrix* vec4(position.xyz,1.0);\n" +
				"v_color = vec4(color,1.0);\n"+
				"}",
			fragmentShaderSource: "uniform vec4 u_bgColor;\n" +
			"varying vec4 v_color;\n"+
				"void main()\n{\n" +
				 "gl_FragColor = v_color;\n"+
				"}\n"
		});
	};
	BOSPrimitive.prototype.setupRenderState = function() {
		this._renderState = RenderState.fromCache({
			cull: {
                enabled: true,
                face: CullFace.FRONT
            },
            depthTest: {
                enabled: true
            },
            depthMask: true,
            blending: undefined
		});
	};
	BOSPrimitive.prototype.setupDrawCommand = function(context) {
		var scope=this;
		// if (defined(this._drawLineCommand)) {
		// 	this._drawLineCommand.vertexArray.destroy(), 
		// 	this._drawLineCommand.vertexArray = this.vertexArray, 
		// 	this._drawLineCommand.modelMatrix = this._modelMatrix, 
		// 	this._drawLineCommand.boundingVolume = this.createBoundingVolume();
		// }else{

		// }
		var uniformMap = {
			u_bgColor: function() {
				return Color.YELLOW
			},
			u_modelViewMatrix: function() {
				return context.uniformState.modelView
			}
		};
		this._drawCommand.modelMatrix = this._modelMatrix;
		this._drawCommand.renderState = this._renderState;
		this._drawCommand.primitiveType = PrimitiveType.TRIANGLES;
		this._drawCommand.shaderProgram = this._shaderProgram;
		this._drawCommand.vertexArray = this.vertexArray;
		this._drawCommand.uniformMap=uniformMap;
		this._drawCommand.pass = Pass.OVERLAY;
		this._drawCommand.boundingVolume = this.createBoundingVolume();
		this._drawCommand.debugShowBoundingVolume = true;
	};
	
	BOSPrimitive.prototype.createBoundingVolume = function() {
		//根据世界坐标计算包围盒
		// var A=new Cartesian3(min.x,min.y,0.0);
		// var B=new Cartesian3(max.x,max.y,0.0);
		// Matrix4.multiplyByPoint(this._modelMatrix, A, A);
		// Matrix4.multiplyByPoint(this._modelMatrix, B, B);
		var points=Cartesian3.unpackArray(this._vertices,[]);
		return BoundingSphere.fromPoints(points);//fromCornerPoints、fromPoints
	};

	return BOSPrimitive;

});