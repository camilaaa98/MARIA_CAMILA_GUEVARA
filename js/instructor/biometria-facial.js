/**
 * Sistema Biométrico de Reconocimiento Facial - AsistNet
 * Utiliza face-api.js con TensorFlow.js para captura real de biometría facial
 * Nivel Profesional - Impresionante UI/UX
 */

// Variables globales del sistema biométrico
let videoStream = null;
let faceApiLoaded = false;
let capturaEnProgreso = false;
let aprendizActual = null;

/**
 * Cargar modelos de face-api.js
 */
async function cargarModelosFaceAPI() {
    if (faceApiLoaded) return true;

    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);

        faceApiLoaded = true;
        console.log('✅ Modelos de Face-API cargados correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error cargando modelos Face-API:', error);
        return false;
    }
}

/**
 * Abrir modal de registro biométrico
 */
async function mostrarModalBiometria(aprendiz) {
    aprendizActual = aprendiz;

    // Crear modal HTML
    const modalHTML = `
        <div id="modal-biometria" class="modal-biometria-overlay">
            <div class="modal-biometria-container">
                <!-- Header -->
                <div class="modal-biometria-header">
                    <div>
                        <h2 class="modal-biometria-title">
                            <span class="icon-biometria">🔬</span>
                            Registro Biométrico Facial
                        </h2>
                        <p class="modal-biometria-subtitle">
                            Aprendiz: <strong>${aprendiz.nombre} ${aprendiz.apellido}</strong>
                        </p>
                    </div>
                    <button onclick="cerrarModalBiometria()" class="btn-close-modal">✕</button>
                </div>

                <!-- Estado de carga -->
                <div id="loading-models" class="loading-container">
                    <div class="loader-biometria"></div>
                    <p class="loading-text">Cargando modelos de IA...</p>
                    <p class="loading-subtext">TensorFlow.js + Face Detection Neural Networks</p>
                </div>

                <!-- Área de captura -->
                <div id="capture-area" class="capture-container" style="display: none;">
                    <!-- Video y Canvas -->
                    <div class="video-wrapper">
                        <video id="video-biometria" autoplay muted playsinline></video>
                        <canvas id="canvas-biometria"></canvas>
                        
                        <!-- Overlay de guía -->
                        <div class="face-guide-overlay">
                            <div class="face-guide-circle"></div>
                            <p class="guide-text">Posicione su rostro dentro del círculo</p>
                        </div>

                        <!-- Indicadores en tiempo real -->
                        <div class="detection-indicators">
                            <div id="indicator-face" class="indicator">
                                <span class="indicator-icon">👤</span>
                                <span class="indicator-label">Rostro detectado</span>
                            </div>
                            <div id="indicator-quality" class="indicator">
                                <span class="indicator-icon">✨</span>
                                <span class="indicator-label">Calidad óptima</span>
                            </div>
                            <div id="indicator-ready" class="indicator">
                                <span class="indicator-icon">✓</span>
                                <span class="indicator-label">Listo para capturar</span>
                            </div>
                        </div>
                    </div>

                    <!-- Panel de información -->
                    <div class="info-panel">
                        <h3 class="info-title">📊 Datos Biométricos en Tiempo Real</h3>
                        
                        <div class="biometric-stats">
                            <div class="stat-item">
                                <span class="stat-label">Confianza de Detección:</span>
                                <div class="stat-bar">
                                    <div id="confidence-bar" class="stat-fill"></div>
                                </div>
                                <span id="confidence-value" class="stat-value">0%</span>
                            </div>

                            <div class="stat-item">
                                <span class="stat-label">Expresión Facial:</span>
                                <span id="expression-value" class="stat-value">-</span>
                            </div>

                            <div class="stat-item">
                                <span class="stat-label">Puntos Faciales:</span>
                                <span id="landmarks-value" class="stat-value">0/68</span>
                            </div>

                            <div class="stat-item">
                                <span class="stat-label">Descriptor Vectorial:</span>
                                <span id="descriptor-value" class="stat-value">No generado</span>
                            </div>
                        </div>

                        <!-- Instrucciones -->
                        <div class="instructions">
                            <p><strong>Instrucciones:</strong></p>
                            <ul>
                                <li>Mire directamente a la cámara</li>
                                <li>Mantenga una expresión neutral</li>
                                <li>Asegure buena iluminación</li>
                                <li>Espere los 3 indicadores verdes</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div id="action-buttons" class="modal-actions" style="display: none;">
                    <button onclick="capturarBiometria()" id="btn-capturar" class="btn-biometric-capture" disabled>
                        <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Capturar Biometría
                    </button>
                    <button onclick="cerrarModalBiometria()" class="btn-cancel">Cancelar</button>
                </div>

                <!-- Resultado de captura -->
                <div id="capture-result" class="capture-result" style="display: none;">
                    <div class="success-animation">
                        <div class="success-checkmark">
                            <div class="check-icon">
                                <span class="icon-line line-tip"></span>
                                <span class="icon-line line-long"></span>
                                <div class="icon-circle"></div>
                                <div class="icon-fix"></div>
                            </div>
                        </div>
                    </div>
                    <h3 class="result-title">¡Biometría Capturada Exitosamente!</h3>
                    <p class="result-text">Los datos biométricos han sido procesados y almacenados de forma segura.</p>
                    <div id="descriptor-preview" class="descriptor-preview"></div>
                </div>
            </div>
        </div>
    `;

    // Insertar modal en el DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Iniciar proceso
    await iniciarSistemaBiometrico();
}

/**
 * Iniciar sistema biométrico
 */
async function iniciarSistemaBiometrico() {
    const loadingDiv = document.getElementById('loading-models');
    const captureDiv = document.getElementById('capture-area');
    const actionsDiv = document.getElementById('action-buttons');

    try {
        // Cargar modelos de IA
        const modelsLoaded = await cargarModelosFaceAPI();

        if (!modelsLoaded) {
            throw new Error('No se pudieron cargar los modelos de IA');
        }

        // Iniciar cámara
        await iniciarCamara();

        // Ocultar loading, mostrar captura
        loadingDiv.style.display = 'none';
        captureDiv.style.display = 'flex';
        actionsDiv.style.display = 'flex';

        // Iniciar detección en tiempo real
        iniciarDeteccionTiempoReal();

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al iniciar el sistema biométrico: ' + error.message);
        cerrarModalBiometria();
    }
}

/**
 * Iniciar cámara
 */
async function iniciarCamara() {
    const video = document.getElementById('video-biometria');

    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });

        video.srcObject = videoStream;

        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
    } catch (error) {
        throw new Error('No se pudo acceder a la cámara. Verifique los permisos.');
    }
}

/**
 * Detección facial en tiempo real
 */
async function iniciarDeteccionTiempoReal() {
    const video = document.getElementById('video-biometria');
    const canvas = document.getElementById('canvas-biometria');
    const displaySize = { width: video.width, height: video.height };

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    faceapi.matchDimensions(canvas, displaySize);

    const indicadorRostro = document.getElementById('indicator-face');
    const indicadorCalidad = document.getElementById('indicator-quality');
    const indicadorListo = document.getElementById('indicator-ready');
    const btnCapturar = document.getElementById('btn-capturar');

    let deteccionesConsecutivas = 0;

    setInterval(async () => {
        if (capturaEnProgreso) return;

        const detections = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withFaceDescriptor();

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        if (detections) {
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

            // Actualizar indicadores
            const confidence = (detections.detection.score * 100).toFixed(1);
            document.getElementById('confidence-value').textContent = confidence + '%';
            document.getElementById('confidence-bar').style.width = confidence + '%';

            // Expresión dominante
            const expressions = detections.expressions;
            const maxExpression = Object.keys(expressions).reduce((a, b) =>
                expressions[a] > expressions[b] ? a : b
            );
            document.getElementById('expression-value').textContent =
                maxExpression.charAt(0).toUpperCase() + maxExpression.slice(1);

            // Landmarks
            document.getElementById('landmarks-value').textContent = '68/68';

            // Descriptor
            document.getElementById('descriptor-value').textContent =
                `Vector de 128 dimensiones generado`;

            // Activar indicadores
            if (detections.detection.score > 0.7) {
                indicadorRostro.classList.add('active');
                deteccionesConsecutivas++;
            } else {
                indicadorRostro.classList.remove('active');
                deteccionesConsecutivas = 0;
            }

            if (detections.detection.score > 0.85) {
                indicadorCalidad.classList.add('active');
            } else {
                indicadorCalidad.classList.remove('active');
            }

            if (deteccionesConsecutivas >= 5) {
                indicadorListo.classList.add('active');
                btnCapturar.disabled = false;
            } else {
                indicadorListo.classList.remove('active');
                btnCapturar.disabled = true;
            }

        } else {
            // No hay rostro detectado
            indicadorRostro.classList.remove('active');
            indicadorCalidad.classList.remove('active');
            indicadorListo.classList.remove('active');
            btnCapturar.disabled = true;
            deteccionesConsecutivas = 0;

            document.getElementById('confidence-value').textContent = '0%';
            document.getElementById('expression-value').textContent = '-';
            document.getElementById('landmarks-value').textContent = '0/68';
        }
    }, 100);
}

/**
 * Capturar biometría
 */
async function capturarBiometria() {
    if (capturaEnProgreso) return;

    capturaEnProgreso = true;
    const video = document.getElementById('video-biometria');
    const btnCapturar = document.getElementById('btn-capturar');

    btnCapturar.disabled = true;
    btnCapturar.innerHTML = '<div class="spinner-small"></div> Procesando...';

    try {
        // Detectar rostro y obtener descriptor
        const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withFaceDescriptor();

        if (!detection) {
            throw new Error('No se detectó ningún rostro. Intente nuevamente.');
        }

        // Extraer datos biométricos
        const datosBiometricos = {
            descriptor: Array.from(detection.descriptor), // Vector de 128 dimensiones
            landmarks: detection.landmarks.positions.map(p => ({ x: p.x, y: p.y })),
            expressions: detection.expressions,
            confidence: detection.detection.score,
            timestamp: new Date().toISOString()
        };

        // Guardar en base de datos
        const currentUser = authSystem.getCurrentUser();
        const response = await fetch('api/biometria/registrar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_aprendiz: aprendizActual.id_aprendiz,
                datos_biometricos: datosBiometricos,
                tipo_biometria: 'facial',
                registrado_por: currentUser.id
            })
        });

        const result = await response.json();

        if (result.success) {
            mostrarResultadoExitoso(datosBiometricos);
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        alert('❌ Error al capturar biometría: ' + error.message);
        btnCapturar.disabled = false;
        btnCapturar.innerHTML = `
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Capturar Biometría
        `;
    }

    capturaEnProgreso = false;
}

/**
 * Mostrar resultado exitoso
 */
function mostrarResultadoExitoso(datos) {
    const captureArea = document.getElementById('capture-area');
    const actionButtons = document.getElementById('action-buttons');
    const resultDiv = document.getElementById('capture-result');
    const descriptorPreview = document.getElementById('descriptor-preview');

    // Ocultar captura
    captureArea.style.display = 'none';
    actionButtons.style.display = 'none';

    // Mostrar resultado con animación
    resultDiv.style.display = 'block';

    // Mostrar preview del descriptor (primeros 10 valores)
    const descriptorHTML = `
        <p><strong>Descriptor Facial (primeros 10 de 128 valores):</strong></p>
        <div class="descriptor-values">
            ${datos.descriptor.slice(0, 10).map((val, i) =>
        `<span class="descriptor-val">${val.toFixed(4)}</span>`
    ).join('')}
            <span class="descriptor-val">...</span>
        </div>
        <p class="descriptor-info">
            <strong>Confianza:</strong> ${(datos.confidence * 100).toFixed(1)}% | 
            <strong>Puntos Faciales:</strong> 68 landmarks detectados
        </p>
    `;
    descriptorPreview.innerHTML = descriptorHTML;

    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
        cerrarModalBiometria();
        // Recargar lista de aprendices para actualizar el estado
        if (typeof cargarAprendices === 'function') {
            cargarAprendices();
        }
    }, 3000);
}

/**
 * Cerrar modal biométrico
 */
function cerrarModalBiometria() {
    // Detener stream de video
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }

    // Remover modal
    const modal = document.getElementById('modal-biometria');
    if (modal) {
        modal.remove();
    }

    capturaEnProgreso = false;
    aprendizActual = null;
}
