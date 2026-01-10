package vierasionGameSite.ESCCUP.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AuthController {

    // 관리자 비밀번호 (원하는 대로 바꾸세요)
    private final String ADMIN_PASSWORD = "hdfejsdhefsj8472478236gkj!#*(!472jhfvghfbwj@!$%!";

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> request) {
        String inputPassword = request.get("password");

        // 비밀번호 검사
        if (ADMIN_PASSWORD.equals(inputPassword)) {
            // 맞으면: 토큰 발급 (실무에선 복잡한 암호화 문자열을 쓰지만, 지금은 간단히 식별자만 줍니다)
            return Map.of("token", "esc_admin_secret_token_2025");
        } else {
            // 틀리면: 에러 발생
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
    }
}