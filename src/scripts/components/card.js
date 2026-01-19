export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  userId 
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.image;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  const likesCount = Array.isArray(data.likes) ? data.likes.length : 0;
  const likeCountElement = cardElement.querySelector(".card__like-count");
  if (likeCountElement) {
    likeCountElement.textContent = likesCount;
  }

  const isLiked = Array.isArray(data.likes) 
    ? data.likes.some(like => like._id === userId) 
    : false;
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.ownerId !== userId) {
    deleteButton.remove(); 
  } else {
    if (onDeleteCard) {
      deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data.id));
    }
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.image }));
  }

  return cardElement;
};