/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
let currentUserId;
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { getCardList, getUserInfo, createCard, deleteRemoteCard, setUserInfo, setAvatar, updateLikeStatus } from "./components/api.js";

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template");
  const clone = template.content.cloneNode(true);
  const dt = clone.querySelector(".popup__info-term");
  const dd = clone.querySelector(".popup__info-description");
  dt.textContent = term;
  dd.textContent = description;
  return clone;
};

const createUserPreview = (name) => {
  const template = document.getElementById("popup-info-user-preview-template");
  const clone = template.content.cloneNode(true);
  const li = clone.querySelector(".popup__list-item");
  li.textContent = name;
  return clone;
};

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalTitle = usersStatsModalWindow.querySelector(".popup__title");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalUsersList = usersStatsModalWindow.querySelector(".popup__list");
const usersStatsModalText = usersStatsModalWindow.querySelector(".popup__text");

const resetForm = (formElement) => {
  const inputs = formElement.querySelectorAll('.popup__input');
  inputs.forEach(input => input.value = '');

  const errors = formElement.querySelectorAll('.popup__error');
  errors.forEach(el => el.textContent = '');

  clearValidation(formElement, validationSettings);
};

const logoElement = document.querySelector(".header__logo") || document.querySelector(".logo");



const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector(".popup__button");
  const creatureText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name
      profileDescription.textContent = userData.about
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = creatureText;
      submitButton.disabled = false;
    }
    );
}; 

const updateAvatar = (avatarUrl) => {
  profileAvatar.style.backgroundImage = `url(${avatarUrl})`;
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".popup__button");
  const creatureText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Сохранение...";
  setAvatar({
    avatar: avatarInput.value
  })
    .then((userData) => {
      updateAvatar(userData.avatar)
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = creatureText;
      submitButton.disabled = false;
    });
}; 

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector(".popup__button");
  const creatureText = submitButton.textContent;
  submitButton.textContent = "Создание...";
  submitButton.disabled = true;
  createCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCardData) => {
      const cardElement = createCardElement(
        {
          name: newCardData.name,
          link: newCardData.link,
        },
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeCard,
          onDeleteCard: deleteCard,
        }
      );
      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = creatureText;
      submitButton.disabled = false;
    });
}

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      // Очищаем предыдущие данные
      usersStatsModalInfoList.innerHTML = "";
      usersStatsModalUsersList.innerHTML = "";

      // Собираем уникальных пользователей
      const uniqueUsers = new Set();
      cards.forEach(card => {
        uniqueUsers.add(card.owner.name);
      });

      // Подсчитываем общее количество карточек
      const totalCards = cards.length;
      // Количество пользователей
      const totalUsers = uniqueUsers.size;

      // Находим максимальное количество карточек от одного пользователя
      const userCardCounts = {};
      cards.forEach(card => {
        const userName = card.owner.name;
        userCardCounts[userName] = (userCardCounts[userName] || 0) + 1;
      });
      const maxCardsPerUser = Math.max(...Object.values(userCardCounts));

      // Дата первой и последней карточки
      const firstCardDate = new Date(cards[cards.length - 1].createdAt);
      const lastCardDate = new Date(cards[0].createdAt);

      // Заполняем информацию
      usersStatsModalInfoList.append(
        createInfoString("Всего карточек:", totalCards)
      );
      usersStatsModalInfoList.append(
        createInfoString("Первая создана:", formatDate(firstCardDate))
      );
      usersStatsModalInfoList.append(
        createInfoString("Последняя создана:", formatDate(lastCardDate))
      );
      usersStatsModalInfoList.append(
        createInfoString("Всего пользователей:", totalUsers)
      );
      usersStatsModalInfoList.append(
        createInfoString("Максимум карточек от одного:", maxCardsPerUser)
      );

      // Заголовок и текст
      usersStatsModalTitle.textContent = "Статистика пользователей";
      usersStatsModalText.textContent = "Все пользователи:";

      // Добавляем пользователей в список
      uniqueUsers.forEach(name => {
        usersStatsModalUsersList.append(createUserPreview(name));
      });

      // Открываем модальное окно
      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  resetForm(avatarForm);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  resetForm(cardForm);
  openModalWindow(cardFormModalWindow);
});

if (logoElement) {
  logoElement.addEventListener("click", handleLogoClick);
} else {
  console.error("Элемент логотипа не найден");
}

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

import { enableValidation, clearValidation } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    updateAvatar(userData.avatar);
    
    currentUserId = userData._id;

    cards.forEach(cardData => {
      const cardElement = createCardElement(
        {
          name: cardData.name,
          image: cardData.link,
          id: cardData._id,
          ownerId: cardData.owner._id,
          likes: cardData.likes,
        },
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (likeButton) => {
            const isCurrentlyLiked = likeButton.classList.contains("card__like-button_is-active");
            
            updateLikeStatus(cardData._id, isCurrentlyLiked)
              .then((updatedCard) => {
                likeButton.classList.toggle("card__like-button_is-active", !isCurrentlyLiked);
                const likeCountElement = likeButton.closest('.card__description')?.querySelector('.card__like-count');
                if (likeCountElement) {
                  const newLikesCount = Array.isArray(updatedCard.likes) ? updatedCard.likes.length : 0;
                  likeCountElement.textContent = newLikesCount;
                }
              })
              .catch(err => {
                console.log(err);
              });
          },
          onDeleteCard: (cardElement, cardId) => {
            deleteRemoteCard(cardId)
              .then(() => cardElement.remove())
              .catch(err => {
                console.log(err);
              });
          },
        },
        currentUserId
      );
      placesWrap.appendChild(cardElement);
    });
  })
  .catch(err => {
    console.log(err);
  });
