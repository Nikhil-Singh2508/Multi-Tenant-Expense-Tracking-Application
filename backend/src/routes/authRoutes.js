const express = require("express");
const router = express.Router();
const supabase = require("../services/supabaseClient");

// SIGN UP
router.post("/signup", async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name, last_name } }
    });

    console.log("SIGNUP RESULT:", data, error);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({
        error: "Signup succeeded but user is null (Email confirmation enabled)"
      });
    }

    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        email,
        first_name, last_name
      });

    console.log("PROFILE INSERT ERROR:", insertError);

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    res.json({
      message: "Signup successful",
      user: data.user
    });

  } catch (err) {
    console.error("SIGNUP CATCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});



// SIGN IN
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({
      message: "Login successful",
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
