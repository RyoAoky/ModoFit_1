document.addEventListener('DOMContentLoaded', function() {
    // Form steps
    const formSteps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const stepLines = document.querySelectorAll('.step-line');
    const stepTexts = document.querySelectorAll('[id^="step-text-"]');
    
    // Navigation buttons
    const nextToStep2Button = document.getElementById('next-to-step-2');
    const nextToStep3Button = document.getElementById('next-to-step-3');
    const backToStep1Button = document.getElementById('back-to-step-1');
    const backToStep2Button = document.getElementById('back-to-step-2');
    
    // Price elements
    const precioTotal = document.getElementById('precio-total');
    const resumenTotal = document.getElementById('resumen-total');
    const precioTotalInput = document.getElementById('precioTotalInput');
    
    // Discount elements
    const descuentoRow = document.getElementById('descuento-row');
    const resumenDescuento = document.getElementById('resumen-descuento');
    const descuentoAplicadoInput = document.getElementById('descuentoAplicadoInput');
    const aplicarDescuentoButton = document.getElementById('aplicar-descuento');
    const quitarDescuentoButton = document.getElementById('quitar-descuento');
    const codigoDescuentoInput = document.getElementById('codigo-descuento');
    const descuentoForm = document.getElementById('descuento-form');
    const descuentoAplicado = document.getElementById('descuento-aplicado');
    const descuentoHint = document.getElementById('descuento-hint');
    
    // Form and validation
    const registroForm = document.getElementById('registroForm');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const terminosCheckbox = document.getElementById('terminos');
    const terminosError = document.getElementById('terminos-error');
    
    // Function to go to next step
    function goToStep(step) {
        // Hide all steps
        formSteps.forEach(formStep => {
            formStep.classList.remove('active');
        });
        
        // Show current step
        document.getElementById(`step-${step}`).classList.add('active');
        
        // Update step indicators
        stepIndicators.forEach((indicator, index) => {
            const stepNumber = index + 1;
            
            indicator.classList.remove('active', 'completed');
            
            if (stepNumber < step) {
                indicator.classList.add('completed');
                indicator.innerHTML = '✓';
            } else if (stepNumber === step) {
                indicator.classList.add('active');
                indicator.innerHTML = stepNumber;
            } else {
                indicator.innerHTML = stepNumber;
            }
        });
        
        // Update step text
        stepTexts.forEach((text, index) => {
            const stepNumber = index + 2; // Step text starts from 2
            
            text.classList.remove('text-secondary');
            
            if (stepNumber <= step) {
                text.classList.add('text-secondary');
            }
        });
        
        // Update step lines
        stepLines.forEach((line, index) => {
            const lineNumber = index + 1;
            
            line.classList.remove('active');
            
            if (lineNumber < step) {
                line.classList.add('active');
            }
        });
        
        // Scroll to top of form
        window.scrollTo({
            top: registroForm.offsetTop - 100,
            behavior: 'smooth'
        });
    }
    
    // Function to validate email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Event listeners for navigation buttons
    if (nextToStep2Button) {
        nextToStep2Button.addEventListener('click', function() {
            // Go to next step
            goToStep(2);
        });
    }
    
    if (nextToStep3Button) {
        nextToStep3Button.addEventListener('click', function() {
            // Validate email
            if (emailInput && !validateEmail(emailInput.value)) {
                emailInput.classList.add('input-error');
                emailError.classList.remove('hidden');
                return;
            }
            
            // Go to next step
            goToStep(3);
        });
    }
    
    if (backToStep1Button) {
        backToStep1Button.addEventListener('click', function() {
            goToStep(1);
        });
    }
    
    if (backToStep2Button) {
        backToStep2Button.addEventListener('click', function() {
            goToStep(2);
        });
    }
    
    // Email validation
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (!validateEmail(emailInput.value)) {
                emailInput.classList.add('input-error');
                emailError.classList.remove('hidden');
            } else {
                emailInput.classList.remove('input-error');
                emailError.classList.add('hidden');
            }
        });
    }
    
    // Discount application
    if (aplicarDescuentoButton) {
        aplicarDescuentoButton.addEventListener('click', function() {
            const codigoDescuento = codigoDescuentoInput.value.trim().toUpperCase();
            
            if (codigoDescuento === 'MODOFIT20') {
                // Show discount
                if (descuentoRow) descuentoRow.classList.remove('hidden');
                if (resumenDescuento) resumenDescuento.classList.remove('hidden');
                if (descuentoForm) descuentoForm.classList.add('hidden');
                if (descuentoAplicado) descuentoAplicado.classList.remove('hidden');
                if (descuentoHint) descuentoHint.classList.add('hidden');
                
                // Update price
                if (precioTotal) precioTotal.textContent = 'S/. 29.90';
                if (resumenTotal) resumenTotal.textContent = 'S/. 29.90';
                if (precioTotalInput) precioTotalInput.value = '29.90';
                if (descuentoAplicadoInput) descuentoAplicadoInput.value = 'true';
                
                // Show success message
                Swal.fire({
                    title: '¡Descuento aplicado!',
                    text: 'Se ha aplicado un descuento de S/. 20.00 a tu compra.',
                    icon: 'success',
                    confirmButtonColor: '#FFCC29'
                });
            } else {
                // Show error message
                Swal.fire({
                    title: 'Código inválido',
                    text: 'El código de descuento ingresado no es válido.',
                    icon: 'error',
                    confirmButtonColor: '#FFCC29'
                });
            }
        });
    }
    
    // Remove discount
    if (quitarDescuentoButton) {
        quitarDescuentoButton.addEventListener('click', function() {
            // Hide discount
            if (descuentoRow) descuentoRow.classList.add('hidden');
            if (resumenDescuento) resumenDescuento.classList.add('hidden');
            if (descuentoForm) descuentoForm.classList.remove('hidden');
            if (descuentoAplicado) descuentoAplicado.classList.add('hidden');
            if (descuentoHint) descuentoHint.classList.remove('hidden');
            
            // Update price
            if (precioTotal) precioTotal.textContent = 'S/. 49.90';
            if (resumenTotal) resumenTotal.textContent = 'S/. 49.90';
            if (precioTotalInput) precioTotalInput.value = '49.90';
            if (descuentoAplicadoInput) descuentoAplicadoInput.value = 'false';
            
            // Clear discount code
            if (codigoDescuentoInput) codigoDescuentoInput.value = '';
            
            // Show message
            Swal.fire({
                title: 'Descuento eliminado',
                text: 'Se ha eliminado el descuento de tu compra.',
                icon: 'info',
                confirmButtonColor: '#FFCC29'
            });
        });
    }
    
    // Form submission
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            // Validate terms
            if (terminosCheckbox && !terminosCheckbox.checked) {
                e.preventDefault();
                terminosError.classList.remove('hidden');
                return;
            } else if (terminosError) {
                terminosError.classList.add('hidden');
            }
            
            // Submit form
            // The form will be submitted to the server
        });
    }
    
    // Load URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    const nuevaCompra = urlParams.get('nueva_compra');
    
    // Set plan if provided
    if (plan && plan === 'modofit') {
        const planSeleccionadoInput = document.getElementById('planSeleccionadoInput');
        if (planSeleccionadoInput) planSeleccionadoInput.value = plan;
    }
    
    // Check if it's a new purchase
    if (nuevaCompra === 'true') {
        // Clear any stored form data
        localStorage.removeItem('modofit_datos_formulario');
    } else {
        // Load stored form data if available
        const datosGuardados = localStorage.getItem('modofit_datos_formulario');
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            
            // Populate form fields
            if (datos.nombre) document.getElementById('nombre').value = datos.nombre;
            if (datos.apellido) document.getElementById('apellido').value = datos.apellido;
            if (datos.email) document.getElementById('email').value = datos.email;
            if (datos.telefono) document.getElementById('telefono').value = datos.telefono;
            if (datos.dni) document.getElementById('dni').value = datos.dni;
            if (datos.direccion) document.getElementById('direccion').value = datos.direccion;
            if (datos.ciudad) document.getElementById('ciudad').value = datos.ciudad;
            if (datos.fechaNacimiento) document.getElementById('fecha-nacimiento').value = datos.fechaNacimiento;
            
            // Set gender
            if (datos.genero) {
                const genderInputs = document.querySelectorAll('input[name="genero"]');
                genderInputs.forEach(input => {
                    if (input.value === datos.genero) input.checked = true;
                });
            }
            
            // Set payment details
            if (datos.numeroTarjeta) document.getElementById('numero-tarjeta').value = datos.numeroTarjeta;
            if (datos.nombreTarjeta) document.getElementById('nombre-tarjeta').value = datos.nombreTarjeta;
            if (datos.fechaExpiracion) document.getElementById('fecha-expiracion').value = datos.fechaExpiracion;
            if (datos.cvv) document.getElementById('cvv').value = datos.cvv;
            
            // Set terms acceptance
            if (datos.terminosAceptados) document.getElementById('terminos').checked = datos.terminosAceptados;
            
            // Set discount
            if (datos.descuentoAplicado) {
                // Apply discount
                if (descuentoRow) descuentoRow.classList.remove('hidden');
                if (resumenDescuento) resumenDescuento.classList.remove('hidden');
                if (descuentoForm) descuentoForm.classList.add('hidden');
                if (descuentoAplicado) descuentoAplicado.classList.remove('hidden');
                if (descuentoHint) descuentoHint.classList.add('hidden');
                
                // Update price
                if (precioTotal) precioTotal.textContent = 'S/. 29.90';
                if (resumenTotal) resumenTotal.textContent = 'S/. 29.90';
                if (precioTotalInput) precioTotalInput.value = '29.90';
                if (descuentoAplicadoInput) descuentoAplicadoInput.value = 'true';
            }
            
            // Restore step
            if (datos.currentStep) {
                goToStep(parseInt(datos.currentStep));
            }
        }
    }
    
    // Save form data when navigating between steps
    function saveFormData() {
        const formData = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            dni: document.getElementById('dni').value,
            direccion: document.getElementById('direccion').value,
            ciudad: document.getElementById('ciudad').value,
            fechaNacimiento: document.getElementById('fecha-nacimiento').value,
            genero: document.querySelector('input[name="genero"]:checked').value,
            numeroTarjeta: document.getElementById('numero-tarjeta').value,
            nombreTarjeta: document.getElementById('nombre-tarjeta').value,
            fechaExpiracion: document.getElementById('fecha-expiracion').value,
            cvv: document.getElementById('cvv').value,
            descuentoAplicado: descuentoAplicadoInput.value === 'true',
            currentStep: document.querySelector('.form-step.active').id.replace('step-', ''),
            terminosAceptados: document.getElementById('terminos').checked
        };
        
        localStorage.setItem('modofit_datos_formulario', JSON.stringify(formData));
    }
    
    // Save form data when changing steps
    if (nextToStep2Button) nextToStep2Button.addEventListener('click', saveFormData);
    if (nextToStep3Button) nextToStep3Button.addEventListener('click', saveFormData);
    if (backToStep1Button) backToStep1Button.addEventListener('click', saveFormData);
    if (backToStep2Button) backToStep2Button.addEventListener('click', saveFormData);
    
    // Generate random order number for confirmation page
    const ordenNumero = document.getElementById('orden-numero');
    if (ordenNumero) {
        ordenNumero.textContent = Math.floor(10000 + Math.random() * 90000);
    }
});