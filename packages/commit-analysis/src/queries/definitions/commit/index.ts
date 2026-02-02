import fullContext from "./full-context"
import filesChanged from "./files-changed"
import subsystems from "./subsystems"
import byDateRange from "./by-date-range"
import byAuthor from "./by-author"

export const commitQueries = [fullContext, filesChanged, subsystems, byDateRange, byAuthor]

export { fullContext, filesChanged, subsystems, byDateRange, byAuthor }
