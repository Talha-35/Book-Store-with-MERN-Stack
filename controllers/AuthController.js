const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");

exports.authRegister = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // FİELD VALİDATİON
  // Verileri doğrulamak için kullanılır. MESELA email mi değil mi gibi ? örnek olarak email içine @ yapmayı unutmuş olabilir. o zaman hata verir

  const validationErr = validationResult(req);
  if (validationErr?.errors?.length > 0) {
    return res
      .status(400)
      .json({ errors: validationErr.array() });
  }

  // USER EXİST CHECK 
  // email kontrolü yapıyoruz. bakalım iki aynı email kayıt oluyor mu ?
  
  const userData = await User.findOne({ email }); // { email : mail@mail.com } şeklinde yazılıyor ama ES6 ile bu zorunluluk kalktı.
    if (userData) {
    return res
      .status(400)
      .json({ errors: [{ message: "User already exists!!" }] });
  }
   
  // PASSWORD HASH
  //Kriptolamaya verilen tanımlama. bir resmi sayıyı veya objeyi belirli bir algoritmadan geçirip anlamsız sayılar hafrler bütünü haline getirmek
  
  const salt = await bcrypt.genSalt(10);
  // const salt = bcrypt.genSaltSync(10);  => yukardaki gibi kullanmak(ASYNC_AWAİT) yerine bu satırdaki gibi de kullanılabilir
  const newPassword = await bcrypt.hash(password, salt);
  // const newPassword = bcrypt.hashSync(password, salt);   => yukardaki gibi kullanmak(ASYNC_AWAİT) yerine bu satırdaki gibi de kullanılabilir

  // SAVE USER
  const user = new User({
    firstName,
    lastName,
    email,
    password: newPassword,
  });
  await user.save();

  //TODO: Error handling for saving
  res.send("Register Completed.");
};




exports.authLogin = async (req, res) => {
  const { email, password } = req.body;

    // FİELD VALİDATİON

  const validationErr = validationResult(req);
  if (validationErr?.errors?.length > 0) {
    return res
      .status(400)
      .json({ errors: validationErr.array() });
  }

  // USER EXİST CHECK  - Kullanıcı var mı ?
  
  const userData = await User.findOne({ email }); // { email : mail@mail.com } şeklinde yazılıyor ama ES6 ile bu zorunluluk kalktı.
  
  if (!userData) { // yukardakinden farklı olarak bu rda user yok ise error verecek. Baştaki ! o işe yarıyor.
    return res
    .status(400)
      .json({ errors: [{ message: "User doesn't exists!!" }] });
    }
    
 // PASSWORD COMPARE / Şifre Karşılaştırma
 const isPasswordMatch = await bcrypt.compare(password, userData.password);
  if (!isPasswordMatch) { // eğer matchh etmedi ise aşağıdaki hatayı dön.
    return res
      .status(400)
      .json({ errors: [{ message: "Invalid credentials" }] });
      // buraya "Invalid credentials" yazılmasının seebebi. email veya pass hangisinin hataı olduğu söylenmiyor
    }

    

  // ***** Burası önemli çünkü artık eşleşen kişiye yetki verilecek.


  // JSON WEB TOKEN - JWT ()
  // Token = Jeton/Bilet => biz bu yetki ile login sayfasındaki kişiye bilet vermiş oluyoruz. bu token ı o yetki kontrolu yapılan yerlerde kullanacağız

  jwt.sign(
    { userData },
    process.env.JWT_SECRET_KEY,
    { expiresIn: 3600 }, 
    // 3600 : 3600 = 24 saat demektir. Burda verilen token'a süre veriliyor. { expiresIn: "24h" }, => bu şekilde de yazılabilir
    (err, token) => {
      if (err) {
        return res.status(400).json({ errors: [{ message: "Unknown Error" }] });
      }
      res.status(202).json({ token });
    }
  );
};
