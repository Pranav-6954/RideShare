package com.example.rideshare.config;
import com.example.rideshare.service.UserService;
import com.example.rideshare.model.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TokenAuthenticationFilter extends OncePerRequestFilter {
 private final UserService userService;
 @Override
 protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
 throws ServletException, IOException {
     String token=req.getHeader("X-Auth-Token");
     if(token!=null && SecurityContextHolder.getContext().getAuthentication()==null){
         userService.findByToken(token).ifPresent(u->{
            var auth=new UsernamePasswordAuthenticationToken(
                u,null,List.of(new SimpleGrantedAuthority("ROLE_"+u.getRole().name())));
            SecurityContextHolder.getContext().setAuthentication(auth);
         });
     }
     chain.doFilter(req,res);
 }
}
