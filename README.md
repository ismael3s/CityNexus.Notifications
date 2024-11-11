# CityNexus.Notifications

Project responsible for dispatch notifications that are received from other projects, at this moment the notification are only for emails.


## Technical Goals

- [x] Have an example of how simple transactions can be managed in Nestjs with cls-transanctional
- [x] Example of integration tests using cls-transactional and TestContainers
- [x] Inbox Pattern example in Nodejs/Nestjs

- [x] TDD (Always in progress)
  - [ ] Unit Tests
  - [x] Integration Tests
     
- [ ] RabbitMQ
  - [x] Consue Messages from the queue
  - [ ] Implement dead letters
  - [ ] Implement dead letters with retry mechanism
  - [x] Idempotent consumer with inbox pattern

- [ ] CI/CD
  - [x] Build and run tests
  - [ ] Update image on DockerHub
  - [ ] Update K8S Manifest

- [x] Docker
- [x] Use React Email
- [x] Send emails using mailpit as mockserver
- [ ] Open Telemtry
