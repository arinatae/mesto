// Показывает ошибку под полем
function showInputError(formElement, inputElement, errorMessage, config) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  if (errorElement) {
    errorElement.textContent = errorMessage;
    inputElement.classList.add(config.inputErrorClass);
    errorElement.classList.add(config.errorVisibleClass);
  }
}

// Скрывает ошибку под полем
function hideInputError(formElement, inputElement, config) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  if (errorElement) {
    errorElement.textContent = '';
    inputElement.classList.remove(config.inputErrorClass);
    errorElement.classList.remove(config.errorVisibleClass);
  }
}

// Проверяет валидность одного поля
function checkInputValidity(formElement, inputElement, config) {
  let errorMessage = '';

  // 1. Обязательное поле (пустое)
  if (inputElement.validity.valueMissing) {
    errorMessage = 'Это поле обязательно к заполнению.';
  }
  // 2. Некорректный URL
  else if (inputElement.type === 'url' && inputElement.validity.typeMismatch) {
    errorMessage = 'Нужно ввести корректную ссылку.';
  }
  // 3. Кастомная валидация: символы и длина (только для полей с data-error-message)
  else if (inputElement.dataset.errorMessage) {
    const allowedCharsRegex = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;

    // Проверка символов
    if (!allowedCharsRegex.test(inputElement.value)) {
      errorMessage = inputElement.dataset.errorMessage;
    }
    // Проверка длины
    else if (
      (inputElement.classList.contains(config.nameInputClass) && (inputElement.value.length < 2 || inputElement.value.length > 40)) ||
      (inputElement.classList.contains(config.cardNameInputClass) && (inputElement.value.length < 2 || inputElement.value.length > 30)) ||
      (inputElement.classList.contains(config.descriptionInputClass) && (inputElement.value.length < 2 || inputElement.value.length > 200))
    ) {
      errorMessage = 'Длина не соответствует требованиям.';
    }
  }

  // Показать или скрыть ошибку
  if (errorMessage) {
    showInputError(formElement, inputElement, errorMessage, config);
  } else {
    hideInputError(formElement, inputElement, config);
  }
}

// Проверяет, есть ли невалидные поля (через класс ошибки!)
function hasInvalidInput(inputList, config) {
  return inputList.some((inputElement) =>
    inputElement.classList.contains(config.inputErrorClass)
  );
}

// Делает кнопку неактивной
function disableSubmitButton(buttonElement, config) {
  buttonElement.disabled = true;
  buttonElement.classList.add(config.inactiveButtonClass);
}

// Делает кнопку активной
function enableSubmitButton(buttonElement, config) {
  buttonElement.disabled = false;
  buttonElement.classList.remove(config.inactiveButtonClass);
}

// Переключает состояние кнопки в зависимости от валидности полей
function toggleButtonState(inputList, buttonElement, config) {
  if (hasInvalidInput(inputList, config)) {
    disableSubmitButton(buttonElement, config);
  } else {
    enableSubmitButton(buttonElement, config);
  }
}

// Настраивает слушатели событий для формы
function setEventListeners(formElement, config) {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);

  if (!buttonElement) return;

  // Изначально кнопка неактивна
  disableSubmitButton(buttonElement, config);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });
}

// Очищает ошибки и деактивирует кнопку (вызывается при открытии формы)
export function clearValidation(formElement, config) {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);

  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, config);
  });

  if (buttonElement) {
    disableSubmitButton(buttonElement, config);
  }
}

// Включает валидацию для всех форм на странице
export function enableValidation(config) {
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  formList.forEach((formElement) => {
    // Предотвращаем отправку формы
    formElement.addEventListener('submit', (evt) => {
      evt.preventDefault();
    });

    // Подключаем валидацию
    setEventListeners(formElement, config);
  });
}