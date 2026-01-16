# L910-Framework

Веб-фреймворчек для Node.js

## Тема: Театр


#### 1. Спектакли (Performances)
| id | number | Уникальный идентификатор |
| title | string | Название спектакля |
| director | string | Режиссёр |
| duration | number | Длительность (минуты) |
| isPremiere | boolean | Является ли премьерой |
| premiereDate | Date (string) | Дата премьеры |
| genres | Array<string> | Жанры |

#### 2. Актёры (Actors)
| id | number | Уникальный идентификатор |
| name | string | ФИО актёра |
| age | number | Возраст |
| isLeadActor | boolean | Ведущий актёр |
| joinDate | Date (string) | Дата вступления в труппу |
| roles | Array<string> | Список ролей |
