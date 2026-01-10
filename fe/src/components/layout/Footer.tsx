import { Link } from 'react-router-dom';
import { Users, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">총동아리연합회</span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              대학교 총동아리연합회는 모든 연합동아리를 지원하고
              학생들의 다양한 활동을 장려합니다.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">바로가기</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/clubs" className="hover:text-accent transition-colors">
                  동아리 목록
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent transition-colors">
                  총동연 소개
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-accent transition-colors">
                  로그인
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">연락처</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                학생회관 201호
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                02-1234-5678
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                club@university.ac.kr
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60">
          © 2024 총동아리연합회. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
