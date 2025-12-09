// https://effulgent-hotteok-36001f.netlify.app/

// Create an element of a given type with text.
const createElemWithText = (type = 'p', text = '', className) =>
  (e = document.createElement(type), e.textContent = text, className && (e
    .className = className), e);

// Create `<option>` elements for a `<select>` based on an array of users.
const createSelectOptions = users =>
  users?.map(user => Object.assign(document.createElement('option'), {
    value: user.id,
    textContent: user.name
  }));

// Show or hide a comment section by id.
const toggleCommentSection = id =>
  !id ? undefined : (e = document.querySelector(`section[data-post-id="${id}"]`)) ?
  (e.classList.toggle('hide'), e) : null;

// Toggle the text of the comment button by id.
const toggleCommentButton = id =>
  !id ? undefined : (e = document.querySelector(`button[data-post-id="${id}"]`)) ?
  ((e.textContent = e.textContent === 'Show Comments' ? 'Hide Comments' :
    'Show Comments'), e) : null;

// Remove all child elements from a given element.
const deleteChildElements = e =>
  e instanceof HTMLElement ? (e.replaceChildren(), e) : undefined;

// Add click listeners to all buttons inside `<main>`.
const addButtonListeners = () => (
  btns = document.querySelectorAll('main button'), btns.forEach(
    btn => (id = btn.dataset.postId) &&
    btn.addEventListener('click', e => toggleComments(e, id))
  ), btns
);

// Remove click listeners from all buttons inside `<main>`.
const removeButtonListeners = () => (
  btns = document.querySelectorAll('main button'), btns.forEach(
    btn => (id = btn.dataset.postId) &&
    btn.removeEventListener('click', e => toggleComments(e, id))
  ), btns
);

// Create comment elements for a post and return a fragment.
const createComments = comments =>
  !comments ? undefined : (
    frag = document.createDocumentFragment(), comments.forEach(c => (
      a = document.createElement('article'), h = createElemWithText('h3', c
        .name), p1 = createElemWithText('p', c.body), p2 = createElemWithText(
        'p', `From: ${c.email}`), a.append(h, p1, p2), frag.append(a)
    )), frag
  );

// Populate the select menu with user options.
const populateSelectMenu = users =>
  !users ? undefined : (
    menu = document.getElementById('selectMenu'),
    menu === null ? undefined : (
      opts = createSelectOptions(users),
      opts?.forEach(opt => selectMenu.append(opt)),
      menu
    )
  );

// Fetch all users.
const getUsers = async () => (
  await fetch('https://jsonplaceholder.typicode.com/users')
    .then(r => r.ok ? r.json() : undefined)
    .catch(e => console.error(e))
);

// Fetch posts for a specific user.
const getUserPosts = async id =>
  !id ? undefined : (
  await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${id}`)
    .then(r => r.ok ? r.json() : undefined)
    .catch(e => console.error(e))
  );

// Fetch a single user.
const getUser = async id =>
  !id ? undefined : (
  await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
    .then(r => r.ok ? r.json() : undefined)
    .catch(e => console.error(e))
  );

// Fetch comments for a specific post.
const getPostComments = async id =>
  !id ? undefined : (
  await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${id}`)
    .then(r => r.ok ? r.json() : undefined)
    .catch(e => console.error(e))
  );

// Build the comment section for a post.
const displayComments = async id =>
  !id ? undefined : (
    section = document.createElement('section'),
    section.dataset.postId = id,
    section.classList.add('comments', 'hide'),
    frag = createComments(await getPostComments(id)),
    section.append(frag),
    section
  );

// Build all posts for a user.
const createPosts = async posts => {
  if (!posts) return undefined;
  const frag = document.createDocumentFragment();
  for (const post of posts) {
    const article = document.createElement('article');
    const h2 = createElemWithText('h2', post.title);
    const body = createElemWithText('p', post.body);
    const id = createElemWithText('p', `Post ID: ${post.id}`);
    const user = await getUser(post.userId);
    const author = createElemWithText('p', `Author: ${user.name} with ${user.company.name}`);
    const phrase = createElemWithText('p', user.company.catchPhrase);
    const button = createElemWithText('button', 'Show Comments');
    button.dataset.postId = post.id;
    const section = await displayComments(post.id);
    article.append(h2, body, id, author, phrase, button, section);
    frag.append(article);
  }
  return frag;
};

// Display posts or default text.
const displayPosts = async posts => (
  main = document.querySelector('main'),
  e = !posts
    ? (p = createElemWithText('p', 'Select an Employee to display their posts.'), p.classList.add('default-text'), p)
    : await createPosts(posts),
  main.append(e),
  e
);

// Toggle comments for a post.
const toggleComments = (ev, id) =>
  !(ev && id) ? undefined : (
    ev.target.listener = true,
    section = toggleCommentSection(id),
    button = toggleCommentButton(id),
    [section, button]
  );

// Refresh the posts displayed on the page.
const refreshPosts = async posts =>
  !posts ? undefined : (
    rm = removeButtonListeners(),
    main = deleteChildElements(document.querySelector('main')),
    frag = await displayPosts(posts),
    add = addButtonListeners(),
    [rm, main, frag, add]
  );

// Handle select menu changes.
const selectMenuChangeEventHandler = async ev => {
  if (!ev) return undefined;
  const select = ev.target;

  let id = Number((select && select.value) || 1);
  if (Number.isNaN(id) || !Number.isInteger(id) || id < 1) id = 1;

  if (select) select.disabled = true;
  const posts = (await getUserPosts(id)) || [];
  const array = (await refreshPosts(posts)) || [];
  if (select) select.disabled = false;

  return [id, posts, array];
};

const initPage = async () => {
  const users = await getUsers();
  const select = populateSelectMenu(users);
  return [users, select];
};

const initApp = () => (
  initPage(),
  document.getElementById('selectMenu')
    .addEventListener('change', selectMenuChangeEventHandler)
);

document.addEventListener("DOMContentLoaded", initApp);
