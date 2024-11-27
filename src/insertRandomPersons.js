const User = require("./src/models/user");
const bcrypt = require("bcrypt")
const { faker } = require('@faker-js/faker');

app.get("/insert", async (req, res) => {
  const password = await bcrypt.hash("123456", 10);
  const documents = Array.from({ length: 50 }, () => {
    // Shuffle the skills array and pick the first 3 unique skills
    const allSkills = ['Java', 'C++', 'React.js', 'Node.js', 'Python', 'Ruby', 'Go', 'Swift', 'PHP', 'Kotlin'];
    const shuffledSkills = faker.helpers.shuffle(allSkills);
    const uniqueSkills = shuffledSkills.slice(0, 3); // Get 3 unique skills

    const userData = {
      firstName: faker.person.firstName(), // Updated to faker.person.firstName()
      lastName: faker.person.lastName(), // Updated to faker.person.lastName()
      age: faker.number.int({ min: 18, max: 60 }), // Updated to faker.number.int()
      gender: faker.helpers.arrayElement(['male', 'female', 'others']), // Updated to faker.person.gender()
      keySkills: uniqueSkills, // Use unique skills
      emailId: faker.internet.email(),
      password: password, // Random password (consider using a secure method for real applications)
      photoUrl: faker.image.avatar(), // Random avatar URL
      summary: faker.lorem.sentence(), // Random summary
      location: faker.location.city() // Updated to faker.location.city()
    };

    return userData;
  });

  // Insert the documents
  const result = await User.insertMany(documents);
  console.log(`${result.insertedCount} documents were inserted`);

  res.status(200).json({ isSuccess: true, message: "ok" })
})
