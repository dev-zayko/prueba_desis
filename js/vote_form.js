const communes = [];

/**
 * Función para validar Rut
 * @param {string} rut - El RUT a validar.
 * @returns {boolean} - True si el RUT es válido, False si no es válido.
 */
function validateRut(rut) {
	if (typeof rut !== 'string') return false;
	const regex = /^[0-9]+-[0-9kK]{1}$/;
	if (!regex.test(rut)) return false;
	const [number, digitVerifier] = rut.split('-');
	const dvCalculated = calculateDigitVerifier(number);
	return dvCalculated === digitVerifier.toUpperCase();
}

/**
 * Función para calcular los dígitos verificadores de un número.
 * @param {string} numero - El número del cual se calcularán los dígitos verificadores.
 * @returns {string} - El dígito verificador calculado.
 */
function calculateDigitVerifier(numero) {
	let suma = 0;
	let factor = 2;
	for (let i = numero.length - 1; i >= 0; i--) {
		suma += parseInt(numero.charAt(i)) * factor;
		factor = factor === 7 ? 2 : factor + 1;
	}
	const resto = suma % 11;
	return resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
}

/**
 * Función para formatear el RUT agregando puntos y guion.
 * @param {string} rut - El RUT a formatear.
 * @returns {string} - El RUT formateado con puntos y guion.
 */
function formatRut(rut) {
	rut = rut.replace(/\./g, ''); // Eliminamos puntos del RUT ingresado
	rut = rut.replace('-', ''); // Eliminamos guion del RUT ingresado

	// Obtenemos el dígito verificador
	const dv = rut.slice(-1);

	// Obtenemos el resto del RUT sin el dígito verificador
	rut = rut.slice(0, -1);

	// Agregamos los puntos al RUT en grupos de tres desde la derecha
	let rutFormatting = '';
	let i = rut.length - 1;
	while (i >= 0) {
		rutFormatting = rut.charAt(i) + rutFormatting;
		if ((rut.length - i) % 3 === 0 && i !== 0) {
			rutFormatting = '.' + rutFormatting;
		}
		i--;
	}

	return rutFormatting + '-' + dv; // Devolvemos el RUT formateado con puntos y guion
}

/**
 * Función para validar el input del RUT en un formulario.
 */
function validateRutInput() {
	const rutInput = $('#rut').val().replace(/\./g, '').trim(); // Eliminar puntos del RUT ingresado
	if (rutInput === '') {
		return;
	}
	if (validateRut(rutInput)) {
		const rutFormatting = formatRut(rutInput);
		$('#rut').val(rutFormatting);
	} else {
		alert('Por favor, ingresa un RUT chileno válido.');
	}
}

/**
 * Función para cargar los candidatos desde la base de datos y agregarlos a un select.
 */
const chargeCandidates = () => {
	chargeData('candidates')
		.then(function (data) {
			var selectCandidates = $('#candidates');
			$.each(data, function (index, candidate) {
				var option = '<option value="' + candidate.id + '">' + candidate.fullname + '</option>';
				selectCandidates.append(option);
			});
		})
		.catch(function (error) {
			alert('Error al obtener candidatos');
			console.error('Error al obtener los datos:', error);
		});
}

/**
 * Función para cargar las regiones desde la base de datos y agregarlas a un select.
 */
const chargeRegion = () => {
	chargeData('regions')
		.then(function (data) {
			var selectRegions = $('#regions');
			$.each(data, function (index, region) {
				var option = '<option value="' + region.id + '">' + region.name + '</option>';
				selectRegions.append(option);
			});
		})
		.catch(function (error) {
			alert('Error al obtener las regiones');
			console.error('Error al obtener los datos:', error);
		});
}

/**
 * Función para cargar las comunas desde la base de datos y almacenarlas en la variable `communes`.
 */
const chargeCommune = () => {
	chargeData('communes')
		.then(function (data) {
			communes.push(...data) // Agregamos la data a la lista vacia comunas.
		})
		.catch(function (error) {
			alert('Error al obtener las regiones');
			console.error('Error al obtener los datos:', error);
		});
}

/**
 * Función para cargar datos desde la base de datos según el tipo de acción especificado.
 * @param {string} action - La acción para cargar los datos (por ejemplo: 'candidates', 'regions', 'communes').
 * @returns {Promise} - Una promesa que resuelve con los datos cargados desde la base de datos.
 */
const chargeData = (action) => {

	return new Promise(function (resolve, reject) {
		$.ajax({
			url: '../functions/get_data.php',
			type: 'GET',
			data: {
				action: action
			},
			dataType: 'json',
			success: function (data) {
				resolve(data); //Resolvemos la promesa devolviendo data.
			},
			error: function (jqXHR, textStatus, errorThrown) {
				reject(errorThrown);
			}
		});
	});
}

/**
 * Función para filtrar las comunas asociadas a una región por su id.
 * @param {number} idRegion - El id de la región para filtrar las comunas.
 * @param {Array} data - La lista de comunas para filtrar.
 * @returns {Array} - Lista de comunas filtradas.
 */
const filterCommunesByRegion = (idRegion, data) => {
	return data.filter((commune) => commune.region_id == idRegion);
}


/**
 * Función para poblar el select de comunas con las comunas asociadas a una región.
 * @param {number} idRegion - El id de la región seleccionada.
 * @param {Array} data - La lista de comunas disponibles.
 */
function populateCommunes(idRegion, data) {
	var selectCommunes = $('#communes');
	selectCommunes.empty();

	const filteredCommunes = filterCommunesByRegion(idRegion, data);
	selectCommunes.append('<option value="not-commune" selected disabled>--Seleccione comuna--</option>');
	filteredCommunes.forEach((commune) => {
		var option = '<option value="' + commune.id + '">' + commune.name + '</option>';
		selectCommunes.append(option);
	});
}

/**
 * Función para validar los inputs en el formulario y mostrar mensajes de error si es necesario.
 */
const validateInput = () => {
	const aliasInput = document.getElementById("alias");
	const aliasError = document.getElementById("aliasError");

	aliasInput.addEventListener("input", validateAlias);

	function validateAlias() {
		const aliasValue = aliasInput.value;

		const hasMinLength = aliasValue.length > 5;

		const hasLettersAndNumbers = /^[A-Za-z0-9]+$/.test(aliasValue);
		if (hasMinLength && hasLettersAndNumbers) {
			aliasError.style.display = "none";
		} else {
			aliasError.style.display = "block";
		}
	}

	const emailInput = document.getElementById("email");
	const emailError = document.getElementById("emailError");

	emailInput.addEventListener("input", validateEmail);

	function validateEmail() {
		const emailValue = emailInput.value;

		const isValidEmail = emailInput.checkValidity();

		if (isValidEmail) {
			emailError.style.display = "none";
		} else {
			emailError.style.display = "block";
		}
	}

}

/**
 * Función principal que se ejecuta al cargar el documento.
 */
$(document).ready(() => {

	validateInput(); //Función para validar input
	chargeCandidates(); //Función para cargar los candidatos en la bd
	chargeRegion(); //Función para cargar las regiones de la bd
	chargeCommune(); //Función para cargar las comunas de la bd

	/**
	 * Funcion de Jquery que se activa con el metodo change
	 */
	$('#regions').change(() => {
		if ($('#regions').value === 'not-region') {

		} else {
			if (communes.length > 0) {
				$('#regions').toArray().map(idRegion => populateCommunes(idRegion.value, communes));
			}

		}

	});

	//#endregion

	//Checkbox
	let maxSelections = 2;
	let checkboxes = document.querySelectorAll('.lbl-check input[type="checkbox"]');

	checkboxes.forEach(function (checkbox) {
		checkbox.addEventListener('change', function () {
			let checkedCount = document.querySelectorAll('.lbl-check input[type="checkbox"]:checked').length;

			if (checkedCount > maxSelections) {
				this.checked = false;
			}
		});
	});

	//#region validar RUT

	$('#rut').blur(validateRutInput);

	//#endregion

	$('#vote_form').submit((e) => {
		e.preventDefault();


		const aliasValue = $('#alias').val().trim();
		const emailValue = $('#email').val().trim();
		const rutValue = $('#rut').val().trim();

		// Verificar las condiciones de validación de cada campo
		const hasValidAlias = aliasValue.length > 5 && /^[A-Za-z0-9]+$/.test(aliasValue);
		const isValidEmail = document.getElementById('email').checkValidity();
		const isValidRut = validateRut(rutValue);

		// Si alguna de las condiciones no se cumple, muestra una alerta y no se envia el codigo
		if (!hasValidAlias) {
			alert('Por favor, ingresa un alias válido (al menos 6 caracteres alfanuméricos).');
			return;
		}

		if (!isValidEmail) {
			alert('Por favor, ingresa un email válido.');
			return;
		}

		if (!isValidRut) {
			alert('Por favor, ingresa un RUT chileno válido con/sin puntos con guion.');
			return;
		}

		// Si todas las condiciones se cumplen, se envia el formulario
		var formData = new FormData(document.getElementById('vote_form'));
		$.ajax({
			type: 'POST',
			url: '../functions/post_data.php', // Obtenemos el URL del action del form
			data: formData,
			processData: false,
			contentType: false,
			success: ((response) => {
				var status = JSON.parse(response).status;
				if (status == 'exists') {
					alert('Ya hay un voto asociado a este RUT');
				} else {
					alert('Voto Registrado');
				}
			}),
			error: ((xhr, status, error) => {
				alert('Error al enviar el formulario: ' + error);
				console.error('Error al enviar el formulario: ', error);
			})
		});
	});
});