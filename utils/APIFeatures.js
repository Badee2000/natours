class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // 1A) Filtering
    //WE MADE IT LIKE THAT TO NOT TAKE A REF OF THE req.query aka "this.queryStr"
    const queryObj = { ...this.queryStr };
    //THIS ARRAY CAN'T BE INSERTED WITH THE REQ.QUERY SO IT HAS TO BE ALONE
    const execludedFields = ['page', 'sort', 'limit', 'field'];
    execludedFields.forEach((el) => delete queryObj[el]);

    // 1B)Advanced Filtering

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2)Sorting
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join('');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // 3)Field Limiting
    if (this.queryStr.field) {
      const field = this.queryStr.field.split(',').join(' ');
      this.query = this.query.select(field);
      // console.log(field);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // 4)Pagination

    //Default
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 3;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
