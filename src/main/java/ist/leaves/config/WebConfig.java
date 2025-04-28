
package ist.leaves.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost",
                        "http://localhost:80",
                        "http://localhost:3000",
                        "http://localhost:8080",
                        "http://127.0.0.1",
                        "http://127.0.0.1:80",
                        "http://127.0.0.1:3000",
                        "http://127.0.0.1:8080",
                        "https://preview--employee-leave-system.lovable.app",
                        "https://b1c7be00-4b60-43f3-be03-67e3b81ad66a.lovableproject.com",
                        "https://id-preview--b1c7be00-4b60-43f3-be03-67e3b81ad66a.lovable.app",
                        "http://frontend" // Docker service name
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600); // 1 hour max age
    }
}
