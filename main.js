const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeType = document.querySelector('#mode-type')

const movies = []
let filteredMovies = []
let currentPage = 1

function renderMovieList(data) {
  let rawHTML = ''
  if (dataPanel.dataset.type === 'card-mode') {
    data.forEach(item => {
      rawHTML += `
       <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top" alt="Movie poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                  data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
    `
      dataPanel.innerHTML = rawHTML
    })
  } else if (dataPanel.dataset.type === 'list-mode') {
    data.forEach(item => {
      rawHTML += `
    <ul class="list-group col-sm-12 mb-2">
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
    </ul>
    `
      dataPanel.innerHTML = rawHTML
    })
  }

}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }

  paginator.innerHTML = rawHTML

}

function getMovieByPage(page) {
  //計算起始Index
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id)
    .then((response => {
      const data = response.data.results
      console.log(data)
      modalTitle.innerText = data.title
      modalDate.innerText = data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    }))

}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('已經加過了!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    console.log(event.target.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword) {
  //   return alert('無效的輸入')
  // }
  // 方法一：使用for迴圈
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //   filteredMovies.push(movie)
  // }}

  // 方法二：filter函式
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  //重新渲染畫面
  renderPaginator(filteredMovies.length)
  renderMovieList(getMovieByPage(1))

})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return //如果點到的不是標籤a，就結束

  const page = Number(event.target.dataset.page)
  currentPage = page
  renderMovieList(getMovieByPage(currentPage))
})

modeType.addEventListener('click', function onListClicked(event) {
  console.log(event.target.id)
  if (event.target.id === 'list-mode-button') {
    dataPanel.dataset.type = 'list-mode'
    console.log(dataPanel.dataset.type)
    renderMovieList(getMovieByPage(currentPage))
  } else if (event.target.id === 'card-mode-button') {
    dataPanel.dataset.type = 'card-mode'
    console.log(dataPanel.dataset.type)
    renderMovieList(getMovieByPage(currentPage))
  }

})


axios.get(INDEX_URL)
  .then((respone) => {
    movies.push(...respone.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMovieByPage(1))
  })

  .catch((err) => console.log(err))