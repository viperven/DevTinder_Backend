# DevTiner Api's

authRouter

- POST /signup
- POST /login
- POST /logout

profileRouter

- get / profile/view
- patch /profile/edit
- patch /profile/passoword

connectionRequestRouter

- post /request/send/interested/:userId
- post /request/send/ignored/:userId
- post /request/review/accepted/:requestId
- post /request/review/rejected/:requestId

user router

- get /connections
- get /request/received
- get /feed -Gets you the profile of other users

  status : ignore,intrested,accepted,rejected
